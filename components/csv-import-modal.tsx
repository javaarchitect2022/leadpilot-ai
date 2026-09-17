"use client";

import { useState } from "react";
import { X, Upload, AlertTriangle, CheckCircle2, FileSpreadsheet } from "lucide-react";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export function CsvImportModal({ isOpen, onClose, onImportComplete }: CsvImportModalProps) {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importedCount, setImportedCount] = useState(0);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const text = await file.text();
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", csvContent: text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse CSV");

      setPreviewResult(data.preview);
      setStep("preview");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!previewResult) return;
    setLoading(true);
    setError("");

    try {
      const validRecords = previewResult.records
        .filter((r: any) => r.isValid && (!skipDuplicates || !r.isDuplicate))
        .map((r: any) => r.data);

      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute",
          validRecords,
          skipDuplicates,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setImportedCount(data.importedCount);
      setStep("done");
      onImportComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-slate-900">Import Leads from CSV</h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-5">
          Bulk upload leads with automatic field mapping, validation, and duplicate detection.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {step === "upload" && (
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-10 text-center transition-colors">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm mb-1">
              Select or Drag CSV File
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Supported columns: Name, Phone, Email, Requirement, Budget, Location, Source
            </p>
            <label className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-indigo-700 shadow-sm transition-colors">
              <span>{loading ? "Analyzing CSV..." : "Browse CSV File"}</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                disabled={loading}
                onChange={handleFileUpload}
              />
            </label>
          </div>
        )}

        {step === "preview" && previewResult && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <p className="text-[11px] text-slate-500">Total Rows</p>
                <p className="text-base font-bold text-slate-900">{previewResult.totalRows}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                <p className="text-[11px] text-emerald-600">Valid Leads</p>
                <p className="text-base font-bold text-emerald-700">{previewResult.validRows}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                <p className="text-[11px] text-amber-600">Duplicates</p>
                <p className="text-base font-bold text-amber-700">{previewResult.duplicateRows}</p>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-center">
                <p className="text-[11px] text-rose-600">Invalid Rows</p>
                <p className="text-base font-bold text-rose-700">{previewResult.invalidRows}</p>
              </div>
            </div>

            {/* Deduplication Switch */}
            <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Skip duplicate phone numbers and emails (Safe import)</span>
              </div>
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            {/* Records Table Preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Phone</th>
                    <th className="p-2">Location</th>
                    <th className="p-2">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewResult.records.slice(0, 15).map((rec: any) => (
                    <tr key={rec.rowNumber} className={rec.isDuplicate ? "bg-amber-50/30" : ""}>
                      <td className="p-2 text-slate-400">{rec.rowNumber}</td>
                      <td className="p-2 font-medium text-slate-800">{rec.data.name || "—"}</td>
                      <td className="p-2 font-mono text-slate-600">{rec.data.phone}</td>
                      <td className="p-2 text-slate-600">{rec.data.location || "—"}</td>
                      <td className="p-2">
                        {rec.isDuplicate ? (
                          <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                            {rec.duplicateReason}
                          </span>
                        ) : rec.isValid ? (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                            Ready to import
                          </span>
                        ) : (
                          <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[10px]">
                            {rec.errors.join(", ")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={loading || previewResult.validRows === 0}
                className="px-5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? "Importing..." : `Import Valid Leads`}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Import Completed!</h4>
            <p className="text-xs text-slate-500 mb-6">
              Successfully imported {importedCount} new lead(s) into your CRM.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
            >
              Close & View Leads
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

