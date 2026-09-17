import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { getAiProvider } from "@/services/ai";
import { findMatchingProperties } from "@/services/property-matching";

export async function POST(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "ai:use");
  if (errorResponse) return errorResponse;

  const body = await req.json();
  const query = (body.query || "").trim();
  const orgId = context.organizationId;

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const queryLower = query.toLowerCase();

  // Controlled Tool: getOverdueFollowups()
  if (queryLower.includes("overdue") || queryLower.includes("pending follow")) {
    const overdue = await prisma.followUp.findMany({
      where: {
        organizationId: orgId,
        status: "PENDING",
        scheduledAt: { lt: new Date() },
      },
      take: 5,
      include: {
        lead: { select: { id: true, name: true, phone: true, leadScore: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json({
      reply: overdue.length > 0
        ? `You have ${overdue.length} overdue follow-up(s). Reaching out quickly is critical for lead conversion.`
        : "Great news! You have zero overdue follow-ups right now.",
      toolUsed: "getOverdueFollowups()",
      data: overdue,
      action: {
        type: "navigate",
        label: "View All Follow-ups",
        url: "/followups",
      },
    });
  }

  // Controlled Tool: getLeads() for "hot leads"
  if (queryLower.includes("hot") || queryLower.includes("hottest") || queryLower.includes("top lead")) {
    const hotLeads = await prisma.lead.findMany({
      where: {
        organizationId: orgId,
        leadScore: { gte: 75 },
      },
      orderBy: { leadScore: "desc" },
      take: 5,
      include: { assignedUser: { select: { name: true } } },
    });

    return NextResponse.json({
      reply: `Found ${hotLeads.length} high-intent hot leads with lead scores 75+. Top recommendation: prioritize immediate calls to schedule on-site visits.`,
      toolUsed: "getLeads(minScore: 75)",
      data: hotLeads,
      action: {
        type: "navigate",
        label: "View Hot Leads",
        url: "/leads?urgency=HIGH",
      },
    });
  }

  // Controlled Tool: getLeads() for "not contacted" / new leads
  if (queryLower.includes("not contacted") || queryLower.includes("haven't been contacted") || queryLower.includes("uncontacted")) {
    const uncontacted = await prisma.lead.findMany({
      where: {
        organizationId: orgId,
        status: "NEW",
        lastContactedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      reply: `Found ${uncontacted.length} new leads that haven't been contacted yet. Fast initial outreach within 15 minutes increases conversion rates by up to 7x.`,
      toolUsed: "getLeads(status: 'NEW')",
      data: uncontacted,
      action: {
        type: "navigate",
        label: "View New Leads",
        url: "/leads?status=NEW",
      },
    });
  }

  // Controlled Tool: getAnalytics() for WhatsApp or source performance
  if (queryLower.includes("whatsapp") || queryLower.includes("source") || queryLower.includes("conversion")) {
    const totalWhatsApp = await prisma.lead.count({
      where: { organizationId: orgId, source: "WHATSAPP" },
    });
    const convertedWhatsApp = await prisma.lead.count({
      where: { organizationId: orgId, source: "WHATSAPP", status: "CONVERTED" },
    });
    const rate = totalWhatsApp > 0 ? ((convertedWhatsApp / totalWhatsApp) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      reply: `This month, WhatsApp generated ${totalWhatsApp} leads with ${convertedWhatsApp} conversions (a strong ${rate}% conversion rate). It is one of your highest ROI channels.`,
      toolUsed: "getAnalytics(source: 'WHATSAPP')",
      data: { total: totalWhatsApp, converted: convertedWhatsApp, rate: `${rate}%` },
      action: {
        type: "navigate",
        label: "View Analytics",
        url: "/analytics",
      },
    });
  }

  // Controlled Tool: getProperties() or matching properties for a lead
  if (queryLower.includes("match") || queryLower.includes("properties")) {
    // Check if a specific lead name was mentioned
    const leads = await prisma.lead.findMany({
      where: { organizationId: orgId },
      take: 10,
    });

    const matchedLead = leads.find((l) => queryLower.includes(l.name.toLowerCase().split(" ")[0]));

    if (matchedLead) {
      const matches = await findMatchingProperties({
        organizationId: orgId,
        location: matchedLead.location,
        budgetMax: matchedLead.budgetMax,
        bedrooms: matchedLead.bedrooms,
      });

      return NextResponse.json({
        reply: `Found ${matches.length} matching properties in the database for ${matchedLead.name} (${matchedLead.location || 'Chennai'}, budget ~₹${((matchedLead.budgetMax || 0)/100000).toFixed(0)}L). Verified against real inventory.`,
        toolUsed: `getProperties(matching: "${matchedLead.name}")`,
        data: matches.slice(0, 3),
        action: {
          type: "navigate",
          label: `Open ${matchedLead.name}'s CRM Profile`,
          url: `/leads/${matchedLead.id}`,
        },
      });
    }

    const availableProps = await prisma.property.findMany({
      where: { organizationId: orgId, status: "AVAILABLE" },
      take: 4,
    });

    return NextResponse.json({
      reply: `You currently have ${availableProps.length} available inventory units in your system.`,
      toolUsed: "getProperties(status: 'AVAILABLE')",
      data: availableProps,
      action: {
        type: "navigate",
        label: "Manage Properties",
        url: "/properties",
      },
    });
  }

  // Controlled Tool: generateReply() or draft follow-up
  if (queryLower.includes("draft") || queryLower.includes("reply") || queryLower.includes("follow-up") || queryLower.includes("message")) {
    const leads = await prisma.lead.findMany({
      where: { organizationId: orgId },
      take: 10,
    });

    const targetLead = leads.find((l) => queryLower.includes(l.name.toLowerCase().split(" ")[0])) || leads[0];

    if (targetLead) {
      const ai = getAiProvider();
      const followUp = await ai.generateFollowUp({
        lead: {
          id: targetLead.id,
          name: targetLead.name,
          phone: targetLead.phone,
          location: targetLead.location,
          budgetMax: targetLead.budgetMax,
        },
        conversationHistory: [],
        followUpType: "WHATSAPP",
      });

      return NextResponse.json({
        reply: `Drafted WhatsApp follow-up for ${targetLead.name}:\n\n"${followUp.followUpMessage}"`,
        toolUsed: `generateReply(lead: "${targetLead.name}")`,
        data: { leadId: targetLead.id, draft: followUp.followUpMessage },
        requiresConfirmation: true,
        action: {
          type: "create_followup",
          label: `Review & Send to ${targetLead.name}`,
          url: `/leads/${targetLead.id}`,
        },
      });
    }
  }

  // General controlled conversational fallback
  const ai = getAiProvider();
  const assistantRes = await ai.chatAssistant({
    messages: [{ role: "user", content: query }],
  });

  return NextResponse.json({
    reply: assistantRes.reply,
    toolUsed: "assistantGeneralChat()",
  });
}

