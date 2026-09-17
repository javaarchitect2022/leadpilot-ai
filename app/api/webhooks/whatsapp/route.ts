import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppService } from "@/services/whatsapp";
import { prisma } from "@/lib/prisma";
import { getAiProvider } from "@/services/ai";
import { recordAuditLog } from "@/services/audit";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode") || "";
  const token = url.searchParams.get("hub.verify_token") || "";
  const challenge = url.searchParams.get("hub.challenge") || "";
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "leadpilot_verify_token_secure";

  const whatsapp = getWhatsAppService();
  if (whatsapp.verifyWebhook(mode, token, expectedToken)) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const whatsapp = getWhatsAppService();
    const parsed = whatsapp.parseInboundMessage(body);

    if (parsed && parsed.fromPhone && parsed.text) {
      const cleanPhone = parsed.fromPhone.replace(/[^0-9]/g, "").slice(-10);

      // Find existing lead by phone
      const lead = await prisma.lead.findFirst({
        where: { phone: { contains: cleanPhone } },
        include: { organization: true },
      });

      if (lead) {
        // Record inbound message activity
        await prisma.activity.create({
          data: {
            organizationId: lead.organizationId,
            leadId: lead.id,
            type: "WHATSAPP",
            description: `Inbound WhatsApp: "${parsed.text}"`,
            metadata: JSON.stringify({ from: parsed.fromPhone, timestamp: parsed.timestamp }),
          },
        });

        // Re-analyze lead with new customer message
        const ai = getAiProvider();
        const analysis = await ai.analyzeLead(parsed.text);

        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            lastContactedAt: new Date(),
            leadScore: Math.max(lead.leadScore, analysis.leadScore),
          },
        });

        await recordAuditLog({
          organizationId: lead.organizationId,
          action: "AI_ANALYSIS_CREATED",
          entityType: "LEAD",
          entityId: lead.id,
          details: { channel: "WHATSAPP_INBOUND", leadScore: analysis.leadScore },
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("WhatsApp webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

