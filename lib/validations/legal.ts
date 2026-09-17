import { z } from "zod";

export const LegalStatusSchema = z.enum([
  "VERIFIED_CLEAR_TITLE",
  "IN_REVIEW",
  "PENDING_VERIFICATION",
  "DISPUTE_FLAGGED",
]);

export type LegalStatus = z.infer<typeof LegalStatusSchema>;

export const LegalChecklistSchema = z.object({
  // 10 Verification Checkpoints (Advocate Due Diligence Checklist)
  ec30Years: z.boolean().default(false).describe("30-Year Encumbrance Certificate (EC) & Nil Encumbrance check via TNREGINET"),
  pattaChitta: z.boolean().default(false).describe("Online Patta/Chitta & FMB sketch match in vendor's name"),
  dtcpCmdaApproval: z.boolean().default(false).describe("DTCP / CMDA / LPA planning layout & building sanction approval"),
  reraRegistered: z.boolean().default(false).describe("TNRERA / State RERA project registration verified"),
  landClassification: z.boolean().default(false).describe("Revenue classification & agricultural conversion (Nanjai/Punjai/Grama Natham)"),
  taxReceipts: z.boolean().default(false).describe("Property tax & local body assessment paid up to date"),
  unbrokenTitleFlow: z.boolean().default(false).describe("30-Year clear genealogical title deed chain & no minor claims"),
  poaVerified: z.boolean().default(false).describe("Power of Attorney (PoA) registered, alive & specific power to alienate"),
  physicalDemarcation: z.boolean().default(false).describe("Physical boundary & survey stone demarcation without encroachment"),
  advocateClearance: z.boolean().default(false).describe("Advocate Legal Opinion Clearance Certificate issued"),

  // Document Reference Identifiers
  dtcpCmdaNumber: z.string().default("").describe("Planning approval number e.g. CMDA/LO/2023/102"),
  pattaNumber: z.string().default("").describe("Patta & Survey Number e.g. Patta 4128 / Survey 204/2B"),
  reraNumber: z.string().default("").describe("TNRERA Registration Number e.g. TN/01/Layout/0284/2023"),
  ecPeriod: z.string().default("").describe("EC coverage period e.g. 1994 - 2024 (30 Years Nil EC)"),
  advocateName: z.string().default("Advocate A.K. Saravanan (AKSPCL)").describe("Legal counsel issuing verification"),
  legalNotes: z.string().default("").describe("Counsel vetting remarks or title observations"),
  verifiedDate: z.string().optional().describe("ISO timestamp of last legal verification"),
  score: z.number().min(0).max(10).default(0),
  status: LegalStatusSchema.default("PENDING_VERIFICATION"),
});

export type LegalChecklist = z.infer<typeof LegalChecklistSchema>;

/**
 * Computes the 10-point title score and determines legal status.
 */
export function calculateLegalMetrics(data: Partial<LegalChecklist>): {
  score: number;
  status: LegalStatus;
} {
  const checkKeys = [
    "ec30Years",
    "pattaChitta",
    "dtcpCmdaApproval",
    "reraRegistered",
    "landClassification",
    "taxReceipts",
    "unbrokenTitleFlow",
    "poaVerified",
    "physicalDemarcation",
    "advocateClearance",
  ] as const;

  let score = 0;
  for (const key of checkKeys) {
    if (data[key] === true) score++;
  }

  let status: LegalStatus = "PENDING_VERIFICATION";
  if (score >= 9) {
    status = "VERIFIED_CLEAR_TITLE";
  } else if (score >= 5) {
    status = "IN_REVIEW";
  } else if (score > 0) {
    status = "PENDING_VERIFICATION";
  }

  return { score, status };
}

export const CHECKLIST_ITEMS_META = [
  {
    key: "ec30Years" as const,
    title: "30-Year Encumbrance Certificate (EC)",
    description: "Verified on TNREGINET / Sub-Registrar Office with continuous Nil Encumbrance entries.",
    authority: "Registration Department (TNREGINET)",
  },
  {
    key: "pattaChitta" as const,
    title: "Online Patta / Chitta & FMB Sketch",
    description: "Revenue Patta registered in vendor's name with matching survey boundaries on FMB sketch.",
    authority: "Revenue Dept (AnyTamilNadu e-Services)",
  },
  {
    key: "dtcpCmdaApproval" as const,
    title: "DTCP / CMDA Planning Sanction",
    description: "Layout & building plan approved by planning authority with Open Space Reservation (OSR) handed over.",
    authority: "CMDA / DTCP / LPA",
  },
  {
    key: "reraRegistered" as const,
    title: "TNRERA Project Registration",
    description: "Project registered on state RERA portal with valid registration and no stop-work notices.",
    authority: "Tamil Nadu Real Estate Regulatory Authority",
  },
  {
    key: "landClassification" as const,
    title: "Land Classification & Ceiling Compliance",
    description: "Land conversion under Sec 47-A approved; free from Tamil Nadu Land Reforms Ceiling limits.",
    authority: "District Collectorate / DTCP",
  },
  {
    key: "taxReceipts" as const,
    title: "Property Tax & Local Body Dues",
    description: "Municipal Corporation / Village Panchayat property tax paid up-to-date with nil arrears.",
    authority: "Greater Chennai Corp / Local Municipality",
  },
  {
    key: "unbrokenTitleFlow" as const,
    title: "30-Year Genealogical Title Deed Chain",
    description: "Clean chronological transfer of parent deeds without partition litigation or minor encumbrances.",
    authority: "Sub-Registrar Jurisdiction (SRO)",
  },
  {
    key: "poaVerified" as const,
    title: "Power of Attorney (PoA) Validation",
    description: "Registered PoA with specific power to sell; Principal verified alive as on transaction date.",
    authority: "Registered SRO Deed",
  },
  {
    key: "physicalDemarcation" as const,
    title: "Physical Demarcation & Fencing",
    description: "Site boundaries physically measured with GPS survey stones; zero encroachment on buffer zones.",
    authority: "Licensed Surveyor / AKSPCL Field Team",
  },
  {
    key: "advocateClearance" as const,
    title: "Advocate Legal Opinion Certificate",
    description: "Formal written Title Clearance Report issued by Advocate A.K. Saravanan (AKSPCL).",
    authority: "Bar Council of Tamil Nadu Advocate",
  },
];

