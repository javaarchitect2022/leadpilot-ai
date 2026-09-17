import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { recordAuditLog } from "@/services/audit";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "property:view");
  if (errorResponse) return errorResponse;

  const property = await prisma.property.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  let images: string[] = [];
  let amenities: string[] = [];
  try {
    if (property.images) images = JSON.parse(property.images);
    if (property.amenities) amenities = JSON.parse(property.amenities);
  } catch {}

  return NextResponse.json({ property: { ...property, images, amenities } });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "property:update");
  if (errorResponse) return errorResponse;

  const body = await req.json();

  const existing = await prisma.property.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const updated = await prisma.property.update({
    where: { id: params.id },
    data: {
      title: body.title !== undefined ? body.title : undefined,
      description: body.description !== undefined ? body.description : undefined,
      location: body.location !== undefined ? body.location : undefined,
      city: body.city !== undefined ? body.city : undefined,
      price: body.price !== undefined ? body.price : undefined,
      propertyType: body.propertyType !== undefined ? body.propertyType : undefined,
      bedrooms: body.bedrooms !== undefined ? body.bedrooms : undefined,
      bathrooms: body.bathrooms !== undefined ? body.bathrooms : undefined,
      area: body.area !== undefined ? body.area : undefined,
      status: body.status !== undefined ? body.status : undefined,
      images: body.images ? JSON.stringify(body.images) : undefined,
      amenities: body.amenities ? JSON.stringify(body.amenities) : undefined,
    },
  });

  await recordAuditLog({
    organizationId: context.organizationId,
    userId: context.user.userId,
    action: "PROPERTY_UPDATED",
    entityType: "PROPERTY",
    entityId: updated.id,
    details: body,
  });

  return NextResponse.json({ success: true, property: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "property:delete");
  if (errorResponse) return errorResponse;

  const existing = await prisma.property.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  await prisma.property.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}

