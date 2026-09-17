export interface SendWhatsAppMessageInput {
  toPhone: string;
  messageText: string;
  templateName?: string;
  templateVariables?: Record<string, string>;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IWhatsAppService {
  sendMessage(input: SendWhatsAppMessageInput): Promise<WhatsAppSendResult>;
  verifyWebhook(hubMode: string, hubToken: string, expectedToken: string): boolean;
  parseInboundMessage(payload: any): {
    fromPhone?: string;
    text?: string;
    name?: string;
    timestamp?: Date;
  } | null;
}

export class WhatsAppCloudService implements IWhatsAppService {
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
  }

  async sendMessage(input: SendWhatsAppMessageInput): Promise<WhatsAppSendResult> {
    if (!this.phoneNumberId || !this.accessToken) {
      return new MockWhatsAppService().sendMessage(input);
    }

    try {
      const url = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: input.toPhone.replace(/[^0-9]/g, ""),
          type: "text",
          text: { body: input.messageText },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data?.error?.message || "WhatsApp API Error" };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  verifyWebhook(hubMode: string, hubToken: string, expectedToken: string): boolean {
    return hubMode === "subscribe" && hubToken === expectedToken;
  }

  parseInboundMessage(payload: any) {
    try {
      const entry = payload.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];
      const contact = change?.contacts?.[0];

      if (!message || message.type !== "text") return null;

      return {
        fromPhone: message.from,
        text: message.text.body,
        name: contact?.profile?.name || "WhatsApp User",
        timestamp: new Date(parseInt(message.timestamp) * 1000),
      };
    } catch {
      return null;
    }
  }
}

export class MockWhatsAppService implements IWhatsAppService {
  private sentMessages: Array<{ to: string; text: string; timestamp: Date }> = [];

  async sendMessage(input: SendWhatsAppMessageInput): Promise<WhatsAppSendResult> {
    this.sentMessages.push({
      to: input.toPhone,
      text: input.messageText,
      timestamp: new Date(),
    });
    console.log(`[MockWhatsApp] Delivered message to ${input.toPhone}: "${input.messageText.substring(0, 60)}..."`);
    return {
      success: true,
      messageId: `wamid.mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  }

  verifyWebhook(hubMode: string, hubToken: string, expectedToken: string): boolean {
    return hubMode === "subscribe" && hubToken === expectedToken;
  }

  parseInboundMessage(payload: any) {
    if (payload?.text && payload?.fromPhone) {
      return {
        fromPhone: payload.fromPhone,
        text: payload.text,
        name: payload.name || "Test Lead",
        timestamp: new Date(),
      };
    }
    return null;
  }
}

export function getWhatsAppService(): IWhatsAppService {
  if (process.env.WHATSAPP_PROVIDER === "WHATSAPP" && process.env.WHATSAPP_ACCESS_TOKEN) {
    return new WhatsAppCloudService();
  }
  return new MockWhatsAppService();
}

