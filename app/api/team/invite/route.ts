import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { hashPassword } from "@/lib/auth";
import { recordAuditLog } from "@/services/audit";
import { getEmailService } from "@/services/email";

const InviteUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["ADMIN", "MANAGER", "SALES_USER"]).default("SALES_USER"),
  phone: z.string().optional(),
  temporaryPassword: z.string().min(6).default("Welcome@123"),
});

export async function POST(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "team:invite");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const parsed = InviteUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existingInOrg = await prisma.user.findFirst({
      where: {
        organizationId: context.organizationId,
        email: data.email.toLowerCase(),
      },
    });

    if (existingInOrg) {
      return NextResponse.json(
        { error: "A team member with this email already exists in your organization" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.temporaryPassword);

    const newUser = await prisma.user.create({
      data: {
        organizationId: context.organizationId,
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role as any,
        phone: data.phone || null,
      },
    });

    // Send invitation email
    const emailService = getEmailService();
    await emailService.sendEmail({
      to: newUser.email,
      subject: `You've been invited to LeadPilot AI by ${context.user.name}`,
      html: `<p>Hello ${newUser.name},</p><p>You have been invited to join your team on LeadPilot AI with the role <strong>${newUser.role}</strong>.</p><p>Temporary password: <code>${data.temporaryPassword}</code></p>`,
    });

    await recordAuditLog({
      organizationId: context.organizationId,
      userId: context.user.userId,
      action: "USER_LOGIN", // Or member invited
      entityType: "USER",
      entityId: newUser.id,
      details: { invitedUserEmail: newUser.email, role: newUser.role },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error("Invite user error:", error);
    return NextResponse.json({ error: "Failed to invite user" }, { status: 500 });
  }
}

