import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { recordAuditLog } from "@/services/audit";

const PropertySchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  city: z.string().min(2, "City is required"),
  price: z.number().positive("Price must be positive"),
  propertyType: z.string().default("Apartment"),
  bedrooms: z.number().int().optional().nullable(),
  bathrooms: z.number().int().optional().nullable(),
  area: z.number().positive().optional().nullable(),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD", "INACTIVE"]).default("AVAILABLE"),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "property:view");
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const legalStatus = url.searchParams.get("legalStatus");
  const city = url.searchParams.get("city");
  const propertyType = url.searchParams.get("propertyType");
  const search = url.searchParams.get("search") || "";

  const where: any = {
    organizationId: context.organizationId,
  };

  if (status && status !== "ALL") where.status = status;
  if (legalStatus && legalStatus !== "ALL") where.legalStatus = legalStatus;
  if (city && city !== "ALL") where.city = city;
  if (propertyType && propertyType !== "ALL") where.propertyType = propertyType;

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { location: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const properties = await prisma.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const formatted = properties.map((p) => {
    let images: string[] = [];
    let amenities: string[] = [];
    let legalScore = 0;
    let legalChecklist: any = null;

    try {
      if (p.images) images = JSON.parse(p.images);
      if (p.amenities) amenities = JSON.parse(p.amenities);
      if (p.legalVerification) {
        legalChecklist = JSON.parse(p.legalVerification);
        legalScore = legalChecklist.score || 0;
      }
    } catch {}

    return {
      ...p,
      images,
      amenities,
      legalScore,
      legalChecklist,
    };
  });

  return NextResponse.json({ properties: formatted });
}

export async function POST(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "property:create");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const parsed = PropertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const property = await prisma.property.create({
      data: {
        organizationId: context.organizationId,
        title: data.title,
        description: data.description || null,
        location: data.location,
        city: data.city,
        price: data.price,
        propertyType: data.propertyType,
        bedrooms: data.bedrooms || null,
        bathrooms: data.bathrooms || null,
        area: data.area || null,
        status: data.status as any,
        amenities: data.amenities ? JSON.stringify(data.amenities) : "[]",
        images: data.images ? JSON.stringify(data.images) : "[]",
      },
    });

    await recordAuditLog({
      organizationId: context.organizationId,
      userId: context.user.userId,
      action: "PROPERTY_CREATED",
      entityType: "PROPERTY",
      entityId: property.id,
      details: { title: property.title, price: property.price },
    });

    return NextResponse.json({ success: true, property }, { status: 201 });
  } catch (error: any) {
    console.error("Create property error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

