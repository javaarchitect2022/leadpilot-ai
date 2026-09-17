import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req);
  if (errorResponse) return errorResponse;

  const notifications = await prisma.notification.findMany({
    where: {
      organizationId: context.organizationId,
      userId: context.user.userId,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const unreadCount = await prisma.notification.count({
    where: {
      organizationId: context.organizationId,
      userId: context.user.userId,
      isRead: false,
    },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const { notificationId } = body;

  if (notificationId) {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        organizationId: context.organizationId,
        userId: context.user.userId,
      },
      data: { isRead: true },
    });
  } else {
    // Mark all as read
    await prisma.notification.updateMany({
      where: {
        organizationId: context.organizationId,
        userId: context.user.userId,
      },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ success: true });
}

