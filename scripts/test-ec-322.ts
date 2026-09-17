import { getTamilNaduLandRecordsFetcher } from "../services/govt-connectors/tn-land-fetcher";
import fs from "fs";
import path from "path";

async function main() {
  const fetcher = getTamilNaduLandRecordsFetcher();
  const testDir = path.join(process.cwd(), "public", "documents", "properties", "test-prop-322");
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  console.log("Starting EC generation for Survey 322/1B1B...");
  const res = await fetcher.automateTnreginetLiveEC(
    {
      zone: "Salem",
      district: "Namakkal",
      sro: "Mallasamuthiram",
      taluk: "Mallasamuthiram",
      village: "Mallasamudram Kilmugam",
      surveyNumber: "322",
      subDivision: "1B1B",
      startDate: "01-Jan-2000",
      endDate: "13-Sep-2026",
    },
    testDir
  );

  console.log("EC Generation Completed successfully!");
  console.log("Result:", JSON.stringify(res, null, 2));

  const pdfPath = path.join(testDir, res.pdfFilename);
  if (fs.existsSync(pdfPath)) {
    console.log("PDF File Generated! Size in bytes:", fs.statSync(pdfPath).size);
  } else {
    console.error("PDF file not found!");
  }
}

main().catch(console.error);

