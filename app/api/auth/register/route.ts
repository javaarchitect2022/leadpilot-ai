import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { recordAuditLog } from "@/services/audit";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.string().default("REAL_ESTATE"),
  city: z.string().min(2, "City is required"),
  country: z.string().default("India"),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create organization slug
    const baseSlug = data.businessName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // Create Organization & Owner User in atomic transaction
    const org = await prisma.organization.create({
      data: {
        name: data.businessName,
        slug,
        businessType: data.businessType,
        city: data.city,
        country: data.country,
        phone: data.phone || null,
        email: data.email.toLowerCase(),
        settings: {
          create: {
            preferredAiProvider: "GEMINI",
            aiResponseTone: "Professional and consultative Indian real estate advisor",
            businessDescription: `${data.businessName} - Trusted real estate consultancy in ${data.city}.`,
            defaultLanguage: "English (Indian)",
          },
        },
        subscription: {
          create: {
            plan: "STARTER",
            status: "TRIAL",
            billingCycle: "MONTHLY",
            leadLimit: 500,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
          },
        },
        users: {
          create: {
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash,
            phone: data.phone || null,
            role: "OWNER",
          },
        },
      },
      include: {
        users: true,
      },
    });

    const user = org.users[0];

    // Create session JWT token
    const token = await createSessionToken({
      userId: user.id,
      organizationId: org.id,
      organizationName: org.name,
      email: user.email,
      name: user.name,
      role: "OWNER",
    });

    await recordAuditLog({
      organizationId: org.id,
      userId: user.id,
      action: "USER_LOGIN",
      entityType: "USER",
      entityId: user.id,
      details: { event: "REGISTER_AND_LOGIN" },
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: org.id,
          organizationName: org.name,
        },
      },
      { status: 201 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}

