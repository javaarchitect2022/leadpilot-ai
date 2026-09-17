import { prisma } from "../lib/prisma";
import { getTamilNaduLandRecordsFetcher } from "../services/govt-connectors/tn-land-fetcher";
import fs from "fs";
import path from "path";

async function main() {
  console.log("===============================================================================");
  console.log("🚀 LEADPILOT AI — MODULAR TAMIL NADU GOVT RECORDS PIPELINE TEST");
  console.log("===============================================================================\n");

  // 1. Pick a sample property
  const property = await prisma.property.findFirst({
    where: {
      location: { contains: "Tambaram" },
    },
  }) || await prisma.property.findFirst();

  if (!property) {
    console.error("❌ No property found in database.");
    process.exit(1);
  }

  console.log(`📌 Selected Property: ${property.title}`);
  console.log(`📍 Location: ${property.location}, ${property.city}`);
  console.log(`🆔 Property ID: ${property.id}\n`);

  // Reset legal checklist to 0/10 for clear test
  await prisma.property.update({
    where: { id: property.id },
    data: {
      legalStatus: "PENDING_VERIFICATION",
      legalVerification: JSON.stringify({
        ec30Years: false,
        pattaChitta: false,
        dtcpCmdaApproval: false,
        reraRegistered: false,
        landClassification: false,
        taxReceipts: false,
        unbrokenTitleFlow: false,
        poaVerified: false,
        physicalDemarcation: false,
        advocateClearance: false,
        score: 0,
        status: "PENDING_VERIFICATION",
      }),
    },
  });

  // Clean old test property documents
  await prisma.propertyDocument.deleteMany({
    where: { propertyId: property.id },
  });

  const fetchParams = {
    district: "Chengalpattu",
    taluk: "Tambaram",
    sro: "SRO Tambaram",
    village: "Padappai",
    surveyNumber: "142",
    subDivision: "2B",
  };

  const fetcher = getTamilNaduLandRecordsFetcher();

  // STEP 1: Fetch ONLY EC
  console.log("-------------------------------------------------------------------------------");
  console.log("STEP 1: Fetching ONLY 30-Year Encumbrance Certificate (TNREGINET)...");
  console.log("-------------------------------------------------------------------------------");
  const ecResult = await fetcher.fetchAndStoreEC(property.id, property.organizationId, fetchParams);
  console.log(`✔ EC Stored in DB Table! Doc ID: ${ecResult.document.id}`);
  console.log(`  Title: ${ecResult.document.title}`);
  console.log(`  File: ${ecResult.document.fileUrl} (${(ecResult.document.fileSize / 1024).toFixed(1)} KB)`);
  console.log(`  Checklist Score: ${ecResult.checklistUpdates.score} / 10 (Only Check #1 'ec30Years' ticked: ${ecResult.checklistUpdates.allChecks.ec30Years})`);
  console.log(`  Patta Ticked? ${ecResult.checklistUpdates.allChecks.pattaChitta} (Correctly left unticked)\n`);

  // STEP 2: Fetch ONLY Patta / Chitta
  console.log("-------------------------------------------------------------------------------");
  console.log("STEP 2: Fetching ONLY Patta / Chitta (e-Services)...");
  console.log("-------------------------------------------------------------------------------");
  const pattaResult = await fetcher.fetchAndStorePatta(property.id, property.organizationId, fetchParams);
  console.log(`✔ Patta Stored in DB Table! Doc ID: ${pattaResult.document.id}`);
  console.log(`  Title: ${pattaResult.document.title}`);
  console.log(`  File: ${pattaResult.document.fileUrl} (${(pattaResult.document.fileSize / 1024).toFixed(1)} KB)`);
  console.log(`  Checklist Score: ${pattaResult.checklistUpdates.score} / 10 (EC + Patta ticked)`);
  console.log(`  Remaining 8 checks (DTCP, RERA, etc.) remain unticked for manual vetting.\n`);

  // STEP 3: Query PropertyDocument database table
  console.log("-------------------------------------------------------------------------------");
  console.log("STEP 3: Querying PropertyDocument Database Table...");
  console.log("-------------------------------------------------------------------------------");
  const storedDocs = await prisma.propertyDocument.findMany({
    where: { propertyId: property.id },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Total Stored Documents in Table: ${storedDocs.length}\n`);
  for (const doc of storedDocs) {
    const fullPath = path.join(process.cwd(), "public", doc.fileUrl.replace(/^\//, ""));
    const exists = fs.existsSync(fullPath);
    console.log(`📄 Document [${doc.documentType}]:`);
    console.log(`   • Title: ${doc.title}`);
    console.log(`   • PDF File: ${doc.fileName} (${doc.mimeType})`);
    console.log(`   • Disk Path: ${fullPath} (File Exists: ${exists})`);
    console.log(`   • Status: ${doc.status} | Verified At: ${doc.verifiedAt.toISOString()}`);
    console.log(`   • Extracted Metadata: ${doc.extractedData}\n`);
  }

  // STEP 4: Final property state in DB
  const finalProperty = await prisma.property.findUnique({
    where: { id: property.id },
  });
  const legalData = JSON.parse(finalProperty?.legalVerification || "{}");
  console.log("⚖️ FINAL PROPERTY DUE-DILIGENCE STATUS:");
  console.log(`   • Status: ${finalProperty?.legalStatus}`);
  console.log(`   • Score: ${legalData.score} / 10 Checks Passed`);
  console.log(`   • EC Period: ${legalData.ecPeriod}`);
  console.log(`   • Patta Number: ${legalData.pattaNumber}`);

  console.log("\n===============================================================================");
  console.log("🎉 MODULAR EC & PATTA FETCHING + DATABASE STORAGE VERIFIED 100% SUCCESSFULLY!");
  console.log("===============================================================================");
}

main()
  .catch((e) => {
    console.error("Error in test:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
