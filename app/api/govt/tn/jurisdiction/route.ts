import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireTenant(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "all";
    const zone = searchParams.get("zone");
    const district = searchParams.get("district");
    const sro = searchParams.get("sro");

    if (action === "zones") {
      const records = await prisma.tnJurisdiction.findMany({
        select: { zone: true },
        distinct: ["zone"],
        orderBy: { zone: "asc" },
      });
      return NextResponse.json({
        zones: records.map((r) => r.zone),
      });
    }

    if (action === "districts") {
      const whereClause: { zone?: string } = {};
      if (zone) whereClause.zone = zone;

      const records = await prisma.tnJurisdiction.findMany({
        where: whereClause,
        select: { district: true },
        distinct: ["district"],
        orderBy: { district: "asc" },
      });
      return NextResponse.json({
        districts: records.map((r) => r.district),
      });
    }

    if (action === "sros") {
      const whereClause: { zone?: string; district?: string } = {};
      if (zone) whereClause.zone = zone;
      if (district) whereClause.district = district;

      const records = await prisma.tnJurisdiction.findMany({
        where: whereClause,
        select: { sro: true },
        distinct: ["sro"],
        orderBy: { sro: "asc" },
      });
      return NextResponse.json({
        sros: records.map((r) => r.sro),
      });
    }

    if (action === "villages") {
      if (!sro && !district) {
        return NextResponse.json(
          { error: "SRO or District is required to query villages" },
          { status: 400 }
        );
      }

      const whereClause: { zone?: string; district?: string; sro?: string } = {};
      if (zone) whereClause.zone = zone;
      if (district) whereClause.district = district;
      if (sro) whereClause.sro = sro;

      const records = await prisma.tnJurisdiction.findMany({
        where: whereClause,
      });

      const villageSet = new Set<string>();
      for (const rec of records) {
        try {
          const parsed = JSON.parse(rec.villages) as string[];
          parsed.forEach((v) => villageSet.add(v));
        } catch {
          // Ignore parse errors
        }
      }

      return NextResponse.json({
        villages: Array.from(villageSet).sort(),
      });
    }

    // Default: Return complete jurisdiction records
    const allRecords = await prisma.tnJurisdiction.findMany({
      orderBy: [{ zone: "asc" }, { district: "asc" }, { sro: "asc" }],
    });

    const parsed = allRecords.map((r) => {
      let villages: string[] = [];
      try {
        villages = JSON.parse(r.villages);
      } catch {
        villages = [];
      }
      return {
        id: r.id,
        zone: r.zone,
        district: r.district,
        sro: r.sro,
        villages,
      };
    });

    return NextResponse.json({ jurisdictions: parsed });
  } catch (error: any) {
    console.error("Error retrieving TN Jurisdiction:", error);
    return NextResponse.json(
      { error: "Failed to retrieve jurisdiction data" },
      { status: 500 }
    );
  }
}

