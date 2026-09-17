import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { calculateLegalMetrics, LegalChecklistSchema } from "@/lib/validations/legal";

describe("Property Document Rejection and Deletion Pipeline", () => {
  const testOrgId = "test-org-delete-doc";
  const testPropId = "test-prop-delete-doc";
  let testDocId = "";

  beforeAll(async () => {
    // Setup test organization and property
    await prisma.organization.upsert({
      where: { id: testOrgId },
      update: {},
      create: {
        id: testOrgId,
        name: "Test Delete Org",
        slug: "test-delete-org",
        city: "Chennai",
      },
    });

    const initialChecklist = {
      ec30Years: true,
      pattaChitta: false,
      dtcpCmdaApproval: false,
      reraRegistered: false,
      landClassification: false,
      taxReceipts: false,
      unbrokenTitleFlow: false,
      poaVerified: false,
      physicalDemarcation: false,
      advocateClearance: false,
      score: 1,
      status: "CRITICAL_ISSUES",
    };

    await prisma.property.upsert({
      where: { id: testPropId },
      update: {
        legalVerification: JSON.stringify(initialChecklist),
        legalStatus: "CRITICAL_ISSUES",
      },
      create: {
        id: testPropId,
        organizationId: testOrgId,
        title: "Test Delete Property",
        location: "Namakkal",
        city: "Namakkal",
        propertyType: "PLOTS",
        price: 5000000,
        legalStatus: "CRITICAL_ISSUES",
        legalVerification: JSON.stringify(initialChecklist),
      },
    });

    // Create a PropertyDocument representing an EC
    const doc = await prisma.propertyDocument.create({
      data: {
        propertyId: testPropId,
        organizationId: testOrgId,
        documentType: "ENCUMBRANCE_CERTIFICATE",
        title: "30-Year Nil EC Test Doc",
        fileName: "test_ec.pdf",
        fileUrl: "/documents/properties/test/test_ec.pdf",
        status: "VERIFIED",
        extractedData: JSON.stringify({ sro: "Mallasamuthiram", isNil: true }),
      },
    });
    testDocId = doc.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.propertyDocument.deleteMany({
      where: { propertyId: testPropId },
    });
    await prisma.property.deleteMany({
      where: { id: testPropId },
    });
    await prisma.organization.deleteMany({
      where: { id: testOrgId },
    });
    await prisma.$disconnect();
  });

  it("should find the created test document in database", async () => {
    const doc = await prisma.propertyDocument.findUnique({
      where: { id: testDocId },
    });
    expect(doc).toBeDefined();
    expect(doc?.title).toBe("30-Year Nil EC Test Doc");
  });

  it("should delete the document and reset ec30Years to false if no other EC exists", async () => {
    // Delete the document
    await prisma.propertyDocument.delete({
      where: { id: testDocId },
    });

    const remainingCount = await prisma.propertyDocument.count({
      where: { propertyId: testPropId, documentType: "ENCUMBRANCE_CERTIFICATE" },
    });
    expect(remainingCount).toBe(0);

    // Simulate the reset logic in DELETE handler
    const prop = await prisma.property.findUnique({
      where: { id: testPropId },
      select: { legalVerification: true },
    });
    const parsed = JSON.parse(prop!.legalVerification!);

    if (remainingCount === 0) {
      parsed.ec30Years = false;
    }

    const metrics = calculateLegalMetrics(parsed);
    parsed.score = metrics.score;
    parsed.status = metrics.status;

    await prisma.property.update({
      where: { id: testPropId },
      data: {
        legalStatus: metrics.status as any,
        legalVerification: JSON.stringify(parsed),
      },
    });

    // Verify property updated
    const updatedProp = await prisma.property.findUnique({
      where: { id: testPropId },
      select: { legalVerification: true, legalStatus: true },
    });
    const updatedChecklist = JSON.parse(updatedProp!.legalVerification!);
    expect(updatedChecklist.ec30Years).toBe(false);
    expect(updatedChecklist.score).toBe(0);
  });
});
