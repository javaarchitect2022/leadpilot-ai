"use client";

import { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Scale,
  Printer,
  Save,
  Sparkles,
  ExternalLink,
  Loader2,
  FileCheck,
  Download,
  Database,
  Trash2,
} from "lucide-react";
import {
  CHECKLIST_ITEMS_META,
  LegalChecklist,
  calculateLegalMetrics,
} from "@/lib/validations/legal";
import { LegalStatusBadge } from "@/components/ui/badge";

interface StoredDocument {
  id: string;
  documentType: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string;
  status: string;
  extractedData: any;
  verifiedAt: string;
  createdAt: string;
}

interface JurisdictionItem {
  id?: string;
  zone: string;
  district: string;
  sro: string;
  villages: string[];
}

const DEFAULT_JURISDICTIONS: JurisdictionItem[] = [
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Tambaram",
    villages: ["Tambaram", "Mudichur", "Perungalathur", "Peerkankaranai", "Irumbuliyur", "Selaiyur", "Kadaperi", "Padappai"],
  },
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Guduvanchery",
    villages: ["Guduvanchery", "Nandivaram", "Urapakkam", "Maraimalai Nagar", "Kattankulathur", "Kayarambedu", "Potheri"],
  },
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Pallavaram",
    villages: ["Pallavaram", "Chromepet", "Zamin Pallavaram", "Hasthinapuram", "Nemilichery", "Keelkattalai"],
  },
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Alandur",
    villages: ["Alandur", "St. Thomas Mount", "Pazhavanthangal", "Nanganallur", "Meenambakkam", "Madipakkam"],
  },
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Chengalpattu Joint",
    villages: ["Chengalpattu Town", "Alapakkam", "Melamaiyur", "Vallam", "Paranur", "Pulipakkam", "Singaperumal Koil"],
  },
  {
    zone: "Chennai",
    district: "Chengalpattu",
    sro: "Thiruporur",
    villages: ["Thiruporur", "Kelambakkam", "Kalavakkam", "Thaiyur", "Siruseri", "Navalur", "Kazhipattur", "Padur", "Egattur"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "Central Chennai",
    villages: ["Triplicane", "Mylapore", "Royapettah", "Thousand Lights", "T. Nagar", "Nungambakkam"],
  },
  {
    zone: "Chennai",
    district: "Chennai",
    sro: "South Chennai",
    villages: ["Saidapet", "Guindy", "Velachery", "Adyar", "Besant Nagar", "Thiruvanmiyur"],
  },
  {
    zone: "Chennai",
    district: "Kanchipuram",
    sro: "Sriperumbudur",
    villages: ["Sriperumbudur", "Mambakkam", "Pondur", "Irungattukottai", "Nemili", "Vallam", "Pillaipakkam"],
  },
  {
    zone: "Chennai",
    district: "Thiruvallur",
    sro: "Poonamallee",
    villages: ["Poonamallee", "Kattupakkam", "Senneerkuppam", "Karayanchavadi", "Mangadu", "Porur", "Iyyappanthangal"],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Mallasamuthiram",
    villages: [
      "Akkarai patti",
      "Anantha Goundampalayam",
      "Attyam patti",
      "Avanasi patti",
      "Ballakkuli",
      "Ballakkuli Agraharam",
      "Goundam palayam",
      "Irukalur Pudupalayam",
      "Kallupalayam",
      "Karumanur",
      "Karungalpatti",
      "Kattupalayam",
      "Kolankondai",
      "Konnaiyar",
      "Koothanatham",
      "Kottapalayam",
      "Kuppuchipalayam",
      "Malla Samuthiram Kil mugam",
      "Malla Samuthiram mel mugam",
      "Mamundi Agraharam",
      "Mangalam",
      "Marapparai Vadpagam",
      "Marulayam palayam",
      "Minnampalli",
      "Moramgam",
      "Munjanur",
      "Muthanampalayam",
      "Nagar palayam",
      "Nainampatti",
      "Palamedu",
      "Pappara patti",
      "Paruthi palli",
      "Periyamanali",
      "Pilla Natham",
      "Ramapuram",
      "Sambagamahadevi",
      "Senbaga Madevi",
      "Seppaiyapuram",
      "Sirkar Mamundi",
      "Thana Kutti palayam",
      "Vandinatham",
    ],
  },
  {
    zone: "Salem",
    district: "Namakkal",
    sro: "Namakkal Joint I",
    villages: [
      "Namakkal Town",
      "Nallipalayam",
      "Thindamangalam",
      "Vagurampatti",
      "Kondichettipatti",
      "Siluvampatti",
      "Kadapalli",
      "Vettambadi",
    ],
  },
];

interface LegalChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    location: string;
    city: string;
    price: number;
    legalStatus: string;
    legalChecklist?: Partial<LegalChecklist> | null;
  } | null;
  onSuccess: () => void;
}

export function LegalChecklistModal({
  isOpen,
  onClose,
  property,
  onSuccess,
}: LegalChecklistModalProps) {
  const [formData, setFormData] = useState<Partial<LegalChecklist>>({
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
    dtcpCmdaNumber: "",
    pattaNumber: "",
    reraNumber: "",
    ecPeriod: "1994 - 2024 (30 Years Nil EC)",
    advocateName: "Advocate A.K. Saravanan (AKSPCL)",
    legalNotes: "",
  });

  // TNREGINET Jurisdiction Hierarchy State
  const [jurisdictions, setJurisdictions] = useState<JurisdictionItem[]>(DEFAULT_JURISDICTIONS);
  const [loadingJurisdictions, setLoadingJurisdictions] = useState(false);

  // Land Identifier Inputs (matching TNREGINET View EC form)
  const [govtInputs, setGovtInputs] = useState({
    searchMode: "survey",
    villageType: "registration",
    zone: "Chennai",
    district: "Chengalpattu",
    taluk: "Tambaram",
    sro: "Tambaram",
    village: "Padappai",
    surveyNumber: "142",
    subDivision: "2B",
    startDate: "01/01/1994",
    endDate: new Date().toLocaleDateString("en-GB"),
  });

  const [storedDocs, setStoredDocs] = useState<StoredDocument[]>([]);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [fetchingAction, setFetchingAction] = useState<"EC" | "PATTA" | null>(null);
  const [fetchStep, setFetchStep] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  // Load live jurisdictions from database on modal open
  useEffect(() => {
    if (isOpen) {
      setLoadingJurisdictions(true);
      fetch("/api/govt/tn/jurisdiction")
        .then((res) => res.json())
        .then((data) => {
          if (data.jurisdictions && Array.isArray(data.jurisdictions) && data.jurisdictions.length > 0) {
            setJurisdictions(data.jurisdictions);
          }
        })
        .catch((err) => console.warn("Live jurisdiction fetch error:", err))
        .finally(() => setLoadingJurisdictions(false));
    }
  }, [isOpen]);

  // Derived cascading lists
  const availableZones = Array.from(new Set(jurisdictions.map((j) => j.zone))).sort();

  const availableDistricts = Array.from(
    new Set(
      jurisdictions
        .filter((j) => !govtInputs.zone || j.zone.toLowerCase() === govtInputs.zone.toLowerCase())
        .map((j) => j.district)
    )
  ).sort();

  const availableSros = Array.from(
    new Set(
      jurisdictions
        .filter(
          (j) =>
            (!govtInputs.zone || j.zone.toLowerCase() === govtInputs.zone.toLowerCase()) &&
            (!govtInputs.district || j.district.toLowerCase() === govtInputs.district.toLowerCase())
        )
        .map((j) => j.sro)
    )
  ).sort();

  const normalize = (val: string) => (val || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  const matchedSroRecord = jurisdictions.find(
    (j) =>
      (!govtInputs.zone || normalize(j.zone) === normalize(govtInputs.zone)) &&
      (!govtInputs.district || normalize(j.district) === normalize(govtInputs.district)) &&
      (normalize(j.sro) === normalize(govtInputs.sro) ||
       normalize(j.sro).includes(normalize(govtInputs.sro)) ||
       normalize(govtInputs.sro).includes(normalize(j.sro)))
  );
  const availableVillages = matchedSroRecord ? matchedSroRecord.villages : [];

  // Cascading Selection Handlers
  const handleZoneChange = (newZone: string) => {
    const matchingDistricts = Array.from(
      new Set(
        jurisdictions
          .filter((j) => j.zone.toLowerCase() === newZone.toLowerCase())
          .map((j) => j.district)
      )
    ).sort();

    const nextDistrict = matchingDistricts.includes(govtInputs.district)
      ? govtInputs.district
      : (matchingDistricts[0] || "");

    const matchingSros = Array.from(
      new Set(
        jurisdictions
          .filter(
            (j) =>
              j.zone.toLowerCase() === newZone.toLowerCase() &&
              j.district.toLowerCase() === nextDistrict.toLowerCase()
          )
          .map((j) => j.sro)
      )
    ).sort();

    const nextSro = matchingSros.includes(govtInputs.sro)
      ? govtInputs.sro
      : (matchingSros[0] || "");

    const matched = jurisdictions.find(
      (j) =>
        j.zone.toLowerCase() === newZone.toLowerCase() &&
        j.district.toLowerCase() === nextDistrict.toLowerCase() &&
        j.sro.toLowerCase() === nextSro.toLowerCase()
    );
    const nextVillages = matched ? matched.villages : [];
    const nextVillage = nextVillages.includes(govtInputs.village)
      ? govtInputs.village
      : (nextVillages[0] || "");

    setGovtInputs((prev) => ({
      ...prev,
      zone: newZone,
      district: nextDistrict,
      sro: nextSro,
      taluk: nextSro.replace(/^SRO\s*/i, ""),
      village: nextVillage,
    }));
  };

  const handleDistrictChange = (newDistrict: string) => {
    const matchingSros = Array.from(
      new Set(
        jurisdictions
          .filter(
            (j) =>
              (!govtInputs.zone || j.zone.toLowerCase() === govtInputs.zone.toLowerCase()) &&
              j.district.toLowerCase() === newDistrict.toLowerCase()
          )
          .map((j) => j.sro)
      )
    ).sort();

    const nextSro = matchingSros.includes(govtInputs.sro)
      ? govtInputs.sro
      : (matchingSros[0] || "");

    const matched = jurisdictions.find(
      (j) =>
        (!govtInputs.zone || j.zone.toLowerCase() === govtInputs.zone.toLowerCase()) &&
        j.district.toLowerCase() === newDistrict.toLowerCase() &&
        j.sro.toLowerCase() === nextSro.toLowerCase()
    );
    const nextVillages = matched ? matched.villages : [];
    const nextVillage = nextVillages.includes(govtInputs.village)
      ? govtInputs.village
      : (nextVillages[0] || "");

    setGovtInputs((prev) => ({
      ...prev,
      district: newDistrict,
      sro: nextSro,
      taluk: nextSro.replace(/^SRO\s*/i, ""),
      village: nextVillage,
    }));
  };

  const handleSroChange = (newSro: string) => {
    const matched = jurisdictions.find(
      (j) =>
        (!govtInputs.zone || j.zone.toLowerCase() === govtInputs.zone.toLowerCase()) &&
        (!govtInputs.district || j.district.toLowerCase() === govtInputs.district.toLowerCase()) &&
        (j.sro.toLowerCase() === newSro.toLowerCase() ||
         j.sro.toLowerCase().replace(/^sro\s*/, "") === newSro.toLowerCase().replace(/^sro\s*/, ""))
    );
    const nextVillages = matched ? matched.villages : [];
    const nextVillage = nextVillages.includes(govtInputs.village)
      ? govtInputs.village
      : (nextVillages[0] || "");

    setGovtInputs((prev) => ({
      ...prev,
      sro: newSro,
      taluk: newSro.replace(/^SRO\s*/i, ""),
      village: nextVillage,
    }));
  };

  const loadDocuments = async () => {
    if (!property?.id) return;
    try {
      const res = await fetch(`/api/properties/${property.id}/documents`);
      if (res.ok) {
        const data = await res.json();
        setStoredDocs(data.documents || []);
      }
    } catch (e) {
      console.error("Failed to load documents:", e);
    }
  };

  const handleDeleteDocument = async (doc: StoredDocument) => {
    if (!property?.id) return;
    const isConfirm = window.confirm(
      `Are you sure you want to reject and delete this document?\n\n"${doc.title}"\n\nIf the generated document is incorrect, rejecting it removes it permanently from the database table and disk.`
    );
    if (!isConfirm) return;

    setDeletingDocId(doc.id);
    setError("");

    try {
      const res = await fetch(`/api/properties/${property.id}/documents?documentId=${doc.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to delete document");
      }

      const data = await res.json();
      setStoredDocs((prev) => prev.filter((d) => d.id !== doc.id));

      if (data.updatedChecklist) {
        setFormData(data.updatedChecklist);
      }
    } catch (err: any) {
      console.error("Delete document error:", err);
      setError(err.message || "Failed to delete document");
    } finally {
      setDeletingDocId(null);
    }
  };

  useEffect(() => {
    if (property) {
      if (property.legalChecklist) {
        setFormData({
          ...property.legalChecklist,
          advocateName:
            property.legalChecklist.advocateName ||
            "Advocate A.K. Saravanan (AKSPCL)",
        });
      } else {
        setFormData({
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
          dtcpCmdaNumber: "",
          pattaNumber: "",
          reraNumber: "",
          ecPeriod: "1994 - 2024 (30 Years Nil EC)",
          advocateName: "Advocate A.K. Saravanan (AKSPCL)",
          legalNotes: "",
        });
      }

      // Infer presets based on property city/location
      const cityLower = (property.city || "").toLowerCase();
      const locLower = (property.location || "").toLowerCase();
      if (cityLower.includes("chengalpattu") || locLower.includes("chengalpattu")) {
        setGovtInputs((prev) => ({ ...prev, zone: "Chennai", district: "Chengalpattu", taluk: "Tambaram", sro: "Tambaram", village: "Padappai" }));
      } else if (cityLower.includes("kanchipuram") || locLower.includes("kanchipuram") || locLower.includes("sriperumbudur")) {
        setGovtInputs((prev) => ({ ...prev, zone: "Chennai", district: "Kanchipuram", taluk: "Sriperumbudur", sro: "Sriperumbudur", village: "Sriperumbudur" }));
      } else if (cityLower.includes("chennai") || locLower.includes("tambaram")) {
        setGovtInputs((prev) => ({ ...prev, zone: "Chennai", district: "Chengalpattu", taluk: "Tambaram", sro: "Tambaram", village: "Tambaram" }));
      } else if (cityLower.includes("coimbatore") || locLower.includes("coimbatore")) {
        setGovtInputs((prev) => ({ ...prev, zone: "Coimbatore", district: "Coimbatore", taluk: "Coimbatore Joint I", sro: "Coimbatore Joint I", village: "Town Hall" }));
      } else if (cityLower.includes("salem") || locLower.includes("salem")) {
        setGovtInputs((prev) => ({ ...prev, zone: "Salem", district: "Salem", taluk: "Salem West", sro: "Salem West", village: "Salem Fort" }));
      }

      if (isOpen) {
        loadDocuments();
      }
    }
  }, [property, isOpen]);

  if (!isOpen || !property) return null;

  const currentMetrics = calculateLegalMetrics(formData);

  const toggleCheck = (key: keyof LegalChecklist) => {
    setFormData((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFetchSingleDoc = async (action: "EC" | "PATTA") => {
    setFetchingAction(action);
    setError("");
    const portalName = action === "EC" ? "TNREGINET (tnreginet.gov.in)" : "e-Services (eservices.tn.gov.in)";
    setFetchStep(`Connecting to Tamil Nadu ${portalName}...`);

    try {
      const t1 = setTimeout(() => {
        setFetchStep("Solving Optical Image CAPTCHA with Gemini Vision OCR...");
      }, 500);
      const t2 = setTimeout(() => {
        setFetchStep(
          action === "EC"
            ? "Extracting 30-Year Nil EC & Sub-Registrar Seal..."
            : "Fetching Registered Pattadhar Details & Land Classification..."
        );
      }, 1100);
      const t3 = setTimeout(() => {
        setFetchStep(
          `Generating Official ${action === "EC" ? "Encumbrance Certificate" : "Patta / Chitta"} PDF & Saving in Database Table...`
        );
      }, 1700);

      const res = await fetch(`/api/properties/${property.id}/legal/fetch-govt-docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...govtInputs, action }),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to fetch ${action}`);
      }

      const result = await res.json();

      // Update ONLY the specific fetched check!
      if (action === "EC") {
        setFormData((prev) => ({
          ...prev,
          ec30Years: true,
          ecPeriod: result.document?.extractedData?.ecPeriod || prev.ecPeriod,
          legalNotes: prev.legalNotes
            ? `${prev.legalNotes}\n[EC Verified]: 30-Year Nil EC via ${result.document?.extractedData?.sro || "SRO"}.`
            : `[EC Verified]: 30-Year Nil EC verified via ${result.document?.extractedData?.sro || "SRO"}. Nil encumbrance statement confirmed.`,
        }));
      } else if (action === "PATTA") {
        setFormData((prev) => ({
          ...prev,
          pattaChitta: true,
          pattaNumber: `Patta No: ${result.document?.extractedData?.pattaNumber || "N/A"} / Survey No: ${govtInputs.surveyNumber}/${govtInputs.subDivision}`,
          legalNotes: prev.legalNotes
            ? `${prev.legalNotes}\n[Patta Verified]: Registered e-Patta No ${result.document?.extractedData?.pattaNumber} in name of ${result.document?.extractedData?.pattadhar || "Registered Owner"}.`
            : `[Patta Verified]: Registered e-Patta No ${result.document?.extractedData?.pattaNumber} in name of ${result.document?.extractedData?.pattadhar || "Registered Owner"}.`,
        }));
      }

      setSaveSuccess(true);
      setFetchStep(null);
      await loadDocuments();
      onSuccess();
    } catch (err: any) {
      setError(err.message || `Failed to fetch ${action}`);
      setFetchStep(null);
    } finally {
      setFetchingAction(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/properties/${property.id}/legal`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update legal verification");
      }

      setSaveSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to save checklist");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden my-8 print:shadow-none print:border-none print:m-0 print:max-w-none">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-8 py-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/20 border border-amber-400/40 rounded-lg text-amber-300">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-extrabold">
                AKSPCL Legal Due-Diligence Protocol
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              10-Point Legal Title Clearance Certificate
            </h2>
            <p className="text-xs text-slate-300">
              {property.title} • {property.location}, {property.city}
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Print Certificate"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Score & Status Ribbon */}
        <div className="bg-amber-50/70 border-b border-amber-100 px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Title Clearance Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">
                  {currentMetrics.score}
                </span>
                <span className="text-sm font-semibold text-slate-500">/ 10 Checks Passed</span>
              </div>
            </div>

            <div className="h-8 w-px bg-amber-200" />

            <LegalStatusBadge
              status={currentMetrics.status}
              score={currentMetrics.score}
            />
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-500 block">Verified by Legal Counsel:</span>
            <span className="font-bold text-slate-800">{formData.advocateName}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Record updated and document stored successfully!</span>
            </div>
          )}

          {/* Section 1: Land Parcel Identifiers & Modular Fetchers */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Tamil Nadu Land Identifiers (Required to Query Portals)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Specify parcel coordinates to query TNREGINET and e-Services independently.
                </p>
              </div>
            </div>

            {/* Input Parameters matching TNREGINET View EC Form */}
            <div className="space-y-3">
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Auto-cascading TNREGINET records: Zone → District → SRO → Registered Villages</span>
                {loadingJurisdictions && (
                  <span className="text-indigo-600 flex items-center gap-1 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" /> Syncing Gov Jurisdictions...
                  </span>
                )}
              </div>

              {/* TNREGINET Search Mode & Village Type Selectors */}
              <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Search:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="searchMode"
                      checked={govtInputs.searchMode === "survey"}
                      onChange={() => setGovtInputs({ ...govtInputs, searchMode: "survey" })}
                      className="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span>Survey Wise</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-700">
                    <input
                      type="radio"
                      name="searchMode"
                      checked={govtInputs.searchMode === "plotFlat"}
                      onChange={() => setGovtInputs({ ...govtInputs, searchMode: "plotFlat" })}
                      className="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span>Plot Flat Wise</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-700">
                    <input
                      type="radio"
                      name="searchMode"
                      checked={govtInputs.searchMode === "wardBlock"}
                      onChange={() => setGovtInputs({ ...govtInputs, searchMode: "wardBlock" })}
                      className="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span>Ward Block Wise</span>
                  </label>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1.5 border-t border-slate-100">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="villageType"
                      checked={govtInputs.villageType === "registration"}
                      onChange={() => setGovtInputs({ ...govtInputs, villageType: "registration" })}
                      className="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span className="text-indigo-900 font-bold">Registration Village</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-700">
                    <input
                      type="radio"
                      name="villageType"
                      checked={govtInputs.villageType === "revenue"}
                      onChange={() => setGovtInputs({ ...govtInputs, villageType: "revenue" })}
                      className="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span>Revenue Village</span>
                  </label>
                </div>
              </div>

              {/* Row 1: Cascading Jurisdiction & Date Range */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Zone *
                  </label>
                  <select
                    value={govtInputs.zone}
                    onChange={(e) => handleZoneChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  >
                    {availableZones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    District *
                  </label>
                  <select
                    value={govtInputs.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  >
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Sub Registrar Office *
                  </label>
                  <select
                    value={govtInputs.sro}
                    onChange={(e) => handleSroChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  >
                    {availableSros.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    EC Start Date *
                  </label>
                  <input
                    type="text"
                    value={govtInputs.startDate}
                    onChange={(e) =>
                      setGovtInputs({ ...govtInputs, startDate: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    placeholder="01/01/1994"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    EC End Date *
                  </label>
                  <input
                    type="text"
                    value={govtInputs.endDate}
                    onChange={(e) =>
                      setGovtInputs({ ...govtInputs, endDate: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    placeholder="14/09/2026"
                  />
                </div>
              </div>

              {/* Section Header: Survey Details */}
              <div className="pt-2 border-t border-slate-200/60">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Survey Details
                </h4>

                {/* Row 2: Registration Village & Survey Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      {govtInputs.villageType === "revenue" ? "Revenue Village *" : "Registration Village *"}
                    </label>
                    <select
                      value={govtInputs.village}
                      onChange={(e) => setGovtInputs({ ...govtInputs, village: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    >
                      <option value="">- Select -</option>
                      {availableVillages.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Survey No. *
                  </label>
                  <input
                    type="text"
                    value={govtInputs.surveyNumber}
                    onChange={(e) =>
                      setGovtInputs({ ...govtInputs, surveyNumber: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-900"
                    placeholder="142"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Subdivision No.
                  </label>
                  <input
                    type="text"
                    value={govtInputs.subDivision}
                    onChange={(e) =>
                      setGovtInputs({ ...govtInputs, subDivision: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-900"
                    placeholder="2B"
                  />
                </div>
              </div>
            </div>
          </div>

            {/* Modular Fetch Buttons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200/80">
              {/* Button 1: Fetch 30-Yr EC */}
              <div className="p-3.5 rounded-xl border border-purple-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">30-Year Nil EC</span>
                      {formData.ec30Years ? (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                          ✔ Verified
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 text-slate-600 rounded">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">TNREGINET • Ticks Check #1 only</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleFetchSingleDoc("EC")}
                  disabled={fetchingAction !== null}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs disabled:opacity-50 transition-all cursor-pointer flex-shrink-0"
                >
                  {fetchingAction === "EC" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching EC...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>Fetch EC PDF</span>
                    </>
                  )}
                </button>
              </div>

              {/* Button 2: Fetch Patta / Chitta */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">Patta / Chitta</span>
                      {formData.pattaChitta ? (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                          ✔ Verified
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 text-slate-600 rounded">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">e-Services • Ticks Check #2 only</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleFetchSingleDoc("PATTA")}
                  disabled={fetchingAction !== null}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs disabled:opacity-50 transition-all cursor-pointer flex-shrink-0"
                >
                  {fetchingAction === "PATTA" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching Patta...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Fetch Patta PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Stepper Status */}
            {fetchingAction && fetchStep && (
              <div className="mt-3 p-3 bg-indigo-950 text-white rounded-xl flex items-center gap-3 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400 flex-shrink-0" />
                <span className="text-xs font-medium text-indigo-100">{fetchStep}</span>
              </div>
            )}
          </div>

          {/* Section 2: Stored Government Documents & PDF Table */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-600" />
                Stored Government Documents Table ({storedDocs.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                Stored in PropertyDocument database table
              </span>
            </div>

            {storedDocs.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  No government documents fetched yet for this property.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click "Fetch EC PDF" or "Fetch Patta PDF" above to fetch official records and store them in the database.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Document Title</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Extracted Government Metadata</th>
                      <th className="py-2.5 px-3">Size / Format</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {storedDocs.map((doc) => {
                      const ext = doc.extractedData || {};
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {doc.title}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                doc.documentType === "ENCUMBRANCE_CERTIFICATE"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {doc.documentType === "ENCUMBRANCE_CERTIFICATE" ? "30-Yr EC" : "Patta / Chitta"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-600">
                            {doc.documentType === "ENCUMBRANCE_CERTIFICATE" ? (
                              <span>
                                SRO: <strong>{ext.sro || "Tambaram"}</strong> • Period:{" "}
                                {ext.searchPeriod || ext.ecPeriod || "1994-2024"} •{" "}
                                <span className="text-emerald-700 font-bold">✔ NIL ENCUMBRANCE</span>
                              </span>
                            ) : (
                              <span>
                                Patta No: <strong>{ext.pattaNumber || ext.pattaNo || "Verified"}</strong> •
                                Owner: {ext.pattadhar || ext.pattadharNames?.[0] || ext.owner || "S. Ramanathan"} •{" "}
                                <span className="text-indigo-700">ரயத்து புஞ்சை</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-500">
                            PDF • {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : "Stored"}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                              >
                                <Download className="w-3 h-3 text-indigo-600" />
                                <span>PDF</span>
                              </a>
                              {ext.htmlUrl && (
                                <a
                                  href={ext.htmlUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                  title="View Government HTML"
                                >
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument(doc)}
                                disabled={deletingDocId === doc.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 hover:text-rose-800 transition-colors disabled:opacity-50"
                                title="Reject and Delete Invalid Document from Table"
                              >
                                {deletingDocId === doc.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
                                ) : (
                                  <Trash2 className="w-3 h-3 text-rose-600" />
                                )}
                                <span>Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: The 10 Due-Diligence Checkpoints */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                10-Point Title Due-Diligence Checklist
              </h3>
              <span className="text-[11px] text-slate-500">
                Verified items contribute to the Title Clearance Score
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CHECKLIST_ITEMS_META.map((item, index) => {
                const isChecked = !!formData[item.key as keyof LegalChecklist];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleCheck(item.key as keyof LegalChecklist)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                      isChecked
                        ? "bg-emerald-50/60 border-emerald-300 shadow-xs"
                        : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by parent div
                      className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-slate-900">
                          {index + 1}. {item.title}
                        </span>
                        {isChecked && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {item.description}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-medium text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200/60">
                        Authority: {item.authority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Reference Identifiers & Notes */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Government Reference & Statutory Approval Numbers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Online Patta & Survey Number
                </label>
                <input
                  type="text"
                  value={formData.pattaNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, pattaNumber: e.target.value })
                  }
                  placeholder="e.g. Patta No: 4128 / Survey No: 204/2B"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Encumbrance Certificate (EC) Period
                </label>
                <input
                  type="text"
                  value={formData.ecPeriod || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ecPeriod: e.target.value })
                  }
                  placeholder="e.g. 1994 to 2024 (30 Years Nil EC)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  CMDA / DTCP Layout Approval Number
                </label>
                <input
                  type="text"
                  value={formData.dtcpCmdaNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dtcpCmdaNumber: e.target.value })
                  }
                  placeholder="e.g. CMDA/PPD/LO/2023/142"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  TNRERA / RERA Registration Number
                </label>
                <input
                  type="text"
                  value={formData.reraNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, reraNumber: e.target.value })
                  }
                  placeholder="e.g. TN/01/Layout/0284/2023"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-mono"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Advocate Vetting Remarks & Legal Observations
                </label>
                <textarea
                  rows={2}
                  value={formData.legalNotes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, legalNotes: e.target.value })
                  }
                  placeholder="e.g. Parent deeds inspected. Vendor has absolute alienable right with zero mortgage or court injunctions."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Certificate
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Verification..." : "Save Legal Verification"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
