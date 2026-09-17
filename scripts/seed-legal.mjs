import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding 10-point Legal Due Diligence Checklists for properties...");

  const properties = await prisma.property.findMany();
  console.log(`Found ${properties.length} properties in database.`);

  const legalProfiles = [
    {
      legalStatus: "VERIFIED_CLEAR_TITLE",
      score: 10,
      checklist: {
        ec30Years: true,
        pattaChitta: true,
        dtcpCmdaApproval: true,
        reraRegistered: true,
        landClassification: true,
        taxReceipts: true,
        unbrokenTitleFlow: true,
        poaVerified: true,
        physicalDemarcation: true,
        advocateClearance: true,
        dtcpCmdaNumber: "CMDA/PPD/LO/2023/184",
        pattaNumber: "Patta No: 5120 / Survey No: 312/1B",
        reraNumber: "TN/01/Building/0248/2023",
        ecPeriod: "1994 - 2024 (30 Years Nil EC Verified)",
        advocateName: "Advocate A.K. Saravanan (AKSPCL)",
        legalNotes: "100% verified clear marketable title. Nil litigation, valid CMDA sanction and registered on TNRERA.",
        score: 10,
        status: "VERIFIED_CLEAR_TITLE",
        verifiedDate: new Date().toISOString(),
      },
    },
    {
      legalStatus: "VERIFIED_CLEAR_TITLE",
      score: 9,
      checklist: {
        ec30Years: true,
        pattaChitta: true,
        dtcpCmdaApproval: true,
        reraRegistered: true,
        landClassification: true,
        taxReceipts: true,
        unbrokenTitleFlow: true,
        poaVerified: true,
        physicalDemarcation: true,
        advocateClearance: false,
        dtcpCmdaNumber: "DTCP/LP/2022/412",
        pattaNumber: "Patta No: 2891 / Survey No: 142/4A",
        reraNumber: "TN/29/Layout/0115/2022",
        ecPeriod: "1994 - 2024 (30 Years Nil EC)",
        advocateName: "Advocate A.K. Saravanan (AKSPCL)",
        legalNotes: "All revenue and planning records clean. Final Advocate Opinion certificate pending formal signature.",
        score: 9,
        status: "VERIFIED_CLEAR_TITLE",
        verifiedDate: new Date().toISOString(),
      },
    },
    {
      legalStatus: "IN_REVIEW",
      score: 6,
      checklist: {
        ec30Years: true,
        pattaChitta: true,
        dtcpCmdaApproval: true,
        reraRegistered: true,
        landClassification: true,
        taxReceipts: true,
        unbrokenTitleFlow: false,
        poaVerified: false,
        physicalDemarcation: false,
        advocateClearance: false,
        dtcpCmdaNumber: "CMDA/PPD/2023/095",
        pattaNumber: "Patta No: 1980 / Survey No: 88/2",
        reraNumber: "TN/01/Building/0512/2023",
        ecPeriod: "2004 - 2024 (20 Years Available)",
        advocateName: "Advocate A.K. Saravanan (AKSPCL)",
        legalNotes: "Earlier 10-year parent deed trace in progress at Sub-Registrar Office.",
        score: 6,
        status: "IN_REVIEW",
        verifiedDate: new Date().toISOString(),
      },
    },
    {
      legalStatus: "PENDING_VERIFICATION",
      score: 2,
      checklist: {
        ec30Years: true,
        pattaChitta: true,
        dtcpCmdaApproval: false,
        reraRegistered: false,
        landClassification: false,
        taxReceipts: false,
        unbrokenTitleFlow: false,
        poaVerified: false,
        physicalDemarcation: false,
        advocateClearance: false,
        dtcpCmdaNumber: "",
        pattaNumber: "Patta applied online",
        reraNumber: "",
        ecPeriod: "Under retrieval",
        advocateName: "Advocate A.K. Saravanan (AKSPCL)",
        legalNotes: "Initial documents received from builder. Revenue inspection pending.",
        score: 2,
        status: "PENDING_VERIFICATION",
        verifiedDate: new Date().toISOString(),
      },
    },
  ];

  for (let i = 0; i < properties.length; i++) {
    const p = properties[i];
    const profile = legalProfiles[i % legalProfiles.length];

    await prisma.property.update({
      where: { id: p.id },
      data: {
        legalStatus: profile.legalStatus,
        legalVerification: JSON.stringify(profile.checklist),
      },
    });
  }

  console.log("Successfully seeded Legal Due Diligence data across all properties!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

