import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

describe("Tamil Nadu TNREGINET Jurisdiction Hierarchy", () => {
  beforeAll(async () => {
    // Ensure test records exist
    const count = await prisma.tnJurisdiction.count();
    if (count === 0) {
      await prisma.tnJurisdiction.create({
        data: {
          zone: "Chennai",
          district: "Chengalpattu",
          sro: "Tambaram",
          villages: JSON.stringify(["Tambaram", "Mudichur", "Perungalathur", "Padappai"]),
        },
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should have populated TNREGINET jurisdiction records in database", async () => {
    const totalCount = await prisma.tnJurisdiction.count();
    expect(totalCount).toBeGreaterThan(0);
  });

  it("should return distinct administrative zones including Chennai, Coimbatore, Salem", async () => {
    const records = await prisma.tnJurisdiction.findMany({
      select: { zone: true },
      distinct: ["zone"],
      orderBy: { zone: "asc" },
    });

    const zones = records.map((r) => r.zone);
    expect(zones).toContain("Chennai");
    expect(zones).toContain("Coimbatore");
    expect(zones).toContain("Salem");
    expect(zones).toContain("Trichy");
    expect(zones).toContain("Madurai");
  });

  it("should cascade from Zone Chennai to its constituent Districts", async () => {
    const records = await prisma.tnJurisdiction.findMany({
      where: { zone: "Chennai" },
      select: { district: true },
      distinct: ["district"],
      orderBy: { district: "asc" },
    });

    const districts = records.map((r) => r.district);
    expect(districts).toContain("Chennai");
    expect(districts).toContain("Chengalpattu");
    expect(districts).toContain("Kanchipuram");
    expect(districts).toContain("Thiruvallur");
  });

  it("should cascade from District Chengalpattu to its constituent SROs", async () => {
    const records = await prisma.tnJurisdiction.findMany({
      where: { zone: "Chennai", district: "Chengalpattu" },
      select: { sro: true },
      distinct: ["sro"],
    });

    const sros = records.map((r) => r.sro);
    expect(sros).toContain("Tambaram");
    expect(sros).toContain("Guduvanchery");
    expect(sros).toContain("Pallavaram");
    expect(sros).toContain("Thiruporur");
  });

  it("should cascade from SRO Tambaram to its registered villages", async () => {
    const sroRecord = await prisma.tnJurisdiction.findFirst({
      where: { zone: "Chennai", district: "Chengalpattu", sro: "Tambaram" },
    });

    expect(sroRecord).toBeDefined();
    expect(sroRecord).not.toBeNull();
    const villages = JSON.parse(sroRecord!.villages) as string[];
    expect(villages).toContain("Tambaram");
    expect(villages).toContain("Mudichur");
    expect(villages).toContain("Perungalathur");
    expect(villages).toContain("Padappai");
  });

  it("should cascade from Zone Salem -> District Namakkal -> SRO Mallasamuthiram -> registration villages", async () => {
    const sroRecord = await prisma.tnJurisdiction.findFirst({
      where: { zone: "Salem", district: "Namakkal", sro: "Mallasamuthiram" },
    });

    expect(sroRecord).toBeDefined();
    expect(sroRecord).not.toBeNull();
    const villages = JSON.parse(sroRecord!.villages) as string[];
    expect(villages).toContain("Malla Samuthiram Kil mugam");
    expect(villages).toContain("Malla Samuthiram mel mugam");
    expect(villages).toContain("Mangalam");
    expect(villages).toContain("Avanasi patti");
    expect(villages).toContain("Ballakkuli");
  });
});

