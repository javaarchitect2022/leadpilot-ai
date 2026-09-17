import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { getAiProvider } from "@/services/ai";
import { recordAuditLog } from "@/services/audit";

const CreateLeadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  source: z.string().default("MANUAL"),
  requirement: z.string().optional(),
  location: z.string().optional(),
  budgetMin: z.number().optional().nullable(),
  budgetMax: z.number().optional().nullable(),
  propertyType: z.string().optional(),
  bedrooms: z.number().optional().nullable(),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  assignedUserId: z.string().optional().nullable(),
  autoAnalyze: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "lead:view");
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status");
  const source = url.searchParams.get("source");
  const urgency = url.searchParams.get("urgency");
  const assignedUserId = url.searchParams.get("assignedUserId");
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "25"), 100);
  const skip = (page - 1) * limit;

  // Multi-tenant where condition
  const where: any = {
    organizationId: context.organizationId,
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
      { location: { contains: search } },
      { requirement: { contains: search } },
    ];
  }

  if (status && status !== "ALL") where.status = status;
  if (source && source !== "ALL") where.source = source;
  if (urgency && urgency !== "ALL") where.urgency = urgency;
  if (assignedUserId && assignedUserId !== "ALL") where.assignedUserId = assignedUserId;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        aiAnalysis: { select: { leadScore: true, summary: true, intent: true, rawOutput: true } },
        _count: { select: { followUps: true, activities: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  const formattedLeads = leads.map((l) => {
    let classification = "GENUINE_BUYER";
    let classificationReason = "Direct end-buyer inquiry";
    if (l.aiAnalysis?.rawOutput) {
      try {
        const parsed = JSON.parse(l.aiAnalysis.rawOutput);
        if (parsed.leadClassification) classification = parsed.leadClassification;
        if (parsed.classificationReason) classificationReason = parsed.classificationReason;
      } catch {}
    }
    return {
      ...l,
      leadClassification: classification,
      classificationReason,
    };
  });

  return NextResponse.json({
    leads: formattedLeads,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "lead:create");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const parsed = CreateLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check plan lead limit
    const sub = await prisma.subscription.findUnique({
      where: { organizationId: context.organizationId },
    });
    if (sub && sub.leadLimit) {
      const countThisMonth = await prisma.lead.count({
        where: {
          organizationId: context.organizationId,
          createdAt: { gte: sub.currentPeriodStart },
        },
      });
      if (countThisMonth >= sub.leadLimit) {
        return NextResponse.json(
          { error: `Monthly lead limit reached (${sub.leadLimit}). Please upgrade your plan.` },
          { status: 403 }
        );
      }
    }

    const lead = await prisma.lead.create({
      data: {
        organizationId: context.organizationId,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        source: data.source as any,
        requirement: data.requirement || null,
        location: data.location || null,
        budgetMin: data.budgetMin || null,
        budgetMax: data.budgetMax || null,
        propertyType: data.propertyType || null,
        bedrooms: data.bedrooms || null,
        urgency: data.urgency as any,
        assignedUserId: data.assignedUserId || null,
        status: "NEW",
        leadScore: 50,
      },
    });

    // Auto AI lead analysis if requested and requirement provided
    if (data.autoAnalyze && data.requirement) {
      try {
        const ai = getAiProvider();
        const analysis = await ai.analyzeLead(data.requirement);

        await prisma.aiAnalysis.create({
          data: {
            organizationId: context.organizationId,
            leadId: lead.id,
            summary: analysis.summary,
            intent: analysis.intent,
            location: analysis.location || data.location || null,
            propertyType: analysis.propertyType || data.propertyType || null,
            bedrooms: analysis.bedrooms ?? data.bedrooms ?? null,
            budgetMin: analysis.budgetMin ?? data.budgetMin ?? null,
            budgetMax: analysis.budgetMax ?? data.budgetMax ?? null,
            urgency: analysis.urgency,
            leadScore: analysis.leadScore,
            missingInformation: JSON.stringify(analysis.missingInformation),
            recommendedNextAction: analysis.recommendedNextAction,
            modelUsed: ai.defaultModel,
            rawOutput: JSON.stringify({
              leadClassification: analysis.leadClassification,
              classificationReason: analysis.classificationReason,
            }),
          },
        });

        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            leadScore: analysis.leadScore,
            priority: analysis.leadScore >= 80 ? "URGENT" : analysis.leadScore >= 60 ? "HIGH" : "MEDIUM",
            purchaseIntent: analysis.intent as any,
            urgency: analysis.urgency as any,
          },
        });
      } catch (err) {
        console.warn("AI lead analysis failed during creation:", err);
      }
    }

    // Record Activity
    await prisma.activity.create({
      data: {
        organizationId: context.organizationId,
        leadId: lead.id,
        userId: context.user.userId,
        type: "NOTE",
        description: `Lead created manually by ${context.user.name}`,
      },
    });

    await recordAuditLog({
      organizationId: context.organizationId,
      userId: context.user.userId,
      action: "LEAD_CREATED",
      entityType: "LEAD",
      entityId: lead.id,
      details: { name: lead.name, source: lead.source },
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    console.error("Create lead error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

