import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAiProvider } from "@/services/ai";
import { recordAuditLog } from "@/services/audit";

// Rate limiting in-memory map: IP -> timestamp array
const ipRequests = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = (ipRequests.get(ip) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  ipRequests.set(ip, timestamps);
  return true;
}

const PublicLeadSubmissionSchema = z.object({
  organizationId: z.string().min(1, "organizationId is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  requirement: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  budgetMax: z.number().optional().nullable(),
  propertyType: z.string().optional().or(z.literal("")),
  // Honeypot spam protection field (must remain empty for human submission)
  _hp_check: z.string().optional(),
});

// Enable CORS for embeddable website widgets
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429, headers: corsHeaders() }
      );
    }

    const body = await req.json();

    // Honeypot check: If the hidden honeypot field is filled, silently discard spam
    if (body._hp_check) {
      console.warn(`[AntiSpam] Bot submission blocked from IP: ${ip}`);
      return NextResponse.json({ success: true, leadId: "spam_filtered" }, { headers: corsHeaders() });
    }

    const parsed = PublicLeadSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400, headers: corsHeaders() }
      );
    }

    const data = parsed.data;

    // Verify organization exists and is active
    const org = await prisma.organization.findUnique({
      where: { id: data.organizationId },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Invalid organization ID" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Create lead in database
    const lead = await prisma.lead.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        requirement: data.requirement || null,
        location: data.location || null,
        budgetMax: data.budgetMax || null,
        propertyType: data.propertyType || null,
        source: "WEBSITE",
        status: "NEW",
        leadScore: 50,
      },
    });

    // Run AI lead analysis immediately
    try {
      const ai = getAiProvider();
      const enquiryText = `Requirement: ${data.requirement || 'Enquiry via website'}. Location: ${data.location || 'Not specified'}. Budget: ${data.budgetMax ? '₹' + data.budgetMax : 'Not specified'}`;
      const analysis = await ai.analyzeLead(enquiryText, `${org.name} - ${org.city}`);

      await prisma.aiAnalysis.create({
        data: {
          organizationId: org.id,
          leadId: lead.id,
          summary: analysis.summary,
          intent: analysis.intent,
          location: analysis.location,
          propertyType: analysis.propertyType,
          bedrooms: analysis.bedrooms,
          budgetMin: analysis.budgetMin,
          budgetMax: analysis.budgetMax,
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

      // Update lead with AI scored fields
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          leadScore: analysis.leadScore,
          priority: analysis.leadScore >= 80 ? "URGENT" : analysis.leadScore >= 60 ? "HIGH" : "MEDIUM",
          purchaseIntent: analysis.intent as any,
          urgency: analysis.urgency as any,
          bedrooms: analysis.bedrooms || lead.bedrooms,
          location: analysis.location || lead.location,
          budgetMin: analysis.budgetMin || lead.budgetMin,
          budgetMax: analysis.budgetMax || lead.budgetMax,
        },
      });
    } catch (aiErr) {
      console.warn("AI analysis on website lead capture failed silently:", aiErr);
    }

    // Record audit log
    await recordAuditLog({
      organizationId: org.id,
      action: "LEAD_CREATED",
      entityType: "LEAD",
      entityId: lead.id,
      details: { source: "WEBSITE_WIDGET", ip },
      ipAddress: ip,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Our property advisory team will contact you shortly.",
        leadId: lead.id,
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error("Public lead capture error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

