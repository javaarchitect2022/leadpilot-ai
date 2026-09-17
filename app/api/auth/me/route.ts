import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  let user: any = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        organization: {
          include: {
            subscription: true,
            settings: true,
          },
        },
      },
    });
  } catch (err) {
    console.warn("Database error in /api/auth/me, using session user data:", err);
  }

  if (user && user.isActive) {
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organizationId: user.organizationId,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          slug: user.organization.slug,
          businessType: user.organization.businessType,
          city: user.organization.city,
          subscription: user.organization.subscription,
          settings: user.organization.settings,
        },
      },
    });
  }

  // Fallback to session data (supports demo accounts when external DB is unconfigured)
  return NextResponse.json({
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
      phone: "+91 98400 11001",
      organizationId: session.organizationId,
      organization: {
        id: session.organizationId,
        name: session.organizationName || "Chennai Prime Realty",
        slug: "chennai-prime-realty",
        businessType: "REAL_ESTATE",
        city: "Chennai",
        subscription: { plan: "GROWTH", status: "ACTIVE" },
        settings: { preferredAiProvider: "GEMINI", defaultLanguage: "English (Indian)" },
      },
    },
  });
}
