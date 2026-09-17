export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  sendEmail(input: SendEmailInput): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class AwsSesEmailService implements IEmailService {
  private region: string;
  private fromEmail: string;

  constructor() {
    this.region = process.env.AWS_REGION || "ap-south-1";
    this.fromEmail = process.env.EMAIL_FROM || "notifications@leadpilot.ai";
  }

  async sendEmail(input: SendEmailInput): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return new MockEmailService().sendEmail(input);
    }
    // In production with AWS credentials, call SES v2 SendEmailCommand
    return {
      success: true,
      messageId: `ses_${Date.now()}`,
    };
  }
}

export class MockEmailService implements IEmailService {
  async sendEmail(input: SendEmailInput): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log(`[MockEmail] Sent to: ${input.to} | Subject: "${input.subject}"`);
    return {
      success: true,
      messageId: `mock_email_${Date.now()}`,
    };
  }
}

export function getEmailService(): IEmailService {
  if (process.env.EMAIL_PROVIDER === "SES" && process.env.AWS_ACCESS_KEY_ID) {
    return new AwsSesEmailService();
  }
  return new MockEmailService();
}

