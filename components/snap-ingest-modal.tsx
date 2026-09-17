"use client";

import { useState, useRef } from "react";
import { X, Camera, Upload, Sparkles, CheckCircle2, AlertCircle, Building2, UserPlus } from "lucide-react";
import { PropertyScanResult } from "@/services/ai/vision-scanner";

interface SnapIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SnapIngestModal({ isOpen, onClose, onSuccess }: SnapIngestModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [scanResult, setScanResult] = useState<PropertyScanResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Editable Form fields pre-filled from scan
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    city: "Chennai",
    price: "",
    propertyType: "Apartment",
    bedrooms: "",
    bathrooms: "",
    area: "",
    contactPhone: "",
    contactName: "",
    notes: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setScanResult(null);
    setSaveSuccess(null);
    setMimeType(file.type || "image/jpeg");

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSelectedImage(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    setScanning(true);
    setError("");
    setScanResult(null);

    try {
      const res = await fetch("/api/properties/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selectedImage,
          mimeType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to scan image");
      }

      const result: PropertyScanResult = data.scanResult;
      setScanResult(result);

      // Pre-fill editable form
      setFormData({
        title: result.title || "",
        location: result.location || "",
        city: result.city || "Chennai",
        price: result.price ? result.price.toString() : "",
        propertyType: result.propertyType || "Apartment",
        bedrooms: result.bedrooms ? result.bedrooms.toString() : "",
        bathrooms: result.bathrooms ? result.bathrooms.toString() : "",
        area: result.area ? result.area.toString() : "",
        contactPhone: result.contactPhone || "",
        contactName: result.contactName || "",
        notes: result.notes || "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to analyze image with Vision AI.");
    } finally {
      setScanning(false);
    }
  };

  const handleSaveToProperties = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          location: formData.location,
          city: formData.city,
          price: parseFloat(formData.price) || 0,
          propertyType: formData.propertyType,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area: formData.area ? parseFloat(formData.area) : null,
          description: formData.notes || `Scanned from street board. Contact: ${formData.contactPhone || "N/A"}`,
          status: "AVAILABLE",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save property");
      }

      setSaveSuccess("Property successfully saved to verified inventory!");
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsLead = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.contactName || `Owner (${formData.location})`,
          phone: formData.contactPhone || "9999999999",
          location: formData.location,
          propertyType: formData.propertyType,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          budgetMax: formData.price ? parseFloat(formData.price) : null,
          requirement: `Property for sale/rent: ${formData.title} in ${formData.location}. ${formData.notes}`,
          source: "MANUAL",
          urgency: "HIGH",
          autoAnalyze: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save lead");
      }

      setSaveSuccess("Owner saved as a high-priority Lead in CRM!");
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to save lead");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setScanResult(null);
    setError("");
    setSaveSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Snap & Ingest AI Scanner
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Gemini Vision
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Snap or upload TO-LET / FOR SALE boards, brochures, or newspaper ads
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-sm text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-sm text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {/* Upload / Capture Section */}
          {!selectedImage ? (
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-8 text-center transition-colors bg-slate-50/50">
              <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Capture photo of a Street Board or Brochure
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Take a photo from your phone camera or drag and drop an image file (JPG, PNG, WebP)
              </p>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center justify-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo (Camera)
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview & Scan Action */}
              <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 group">
                <img
                  src={selectedImage}
                  alt="Scanned preview"
                  className="w-full h-48 object-contain bg-slate-950/60"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full p-1.5 shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!scanResult ? (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleScan}
                    disabled={scanning}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 animate-spin" />
                    {scanning ? "Scanning Board & Extracting Data..." : "⚡ Scan Image with Gemini AI Vision"}
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                    Auto-extracts price, location, BHK, amenities, and owner mobile number
                  </p>
                </div>
              ) : (
                /* Extracted & Editable Data Form */
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      AI Extracted Details
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {scanResult.confidenceScore}% Confidence ({scanResult.detectedType.replace(/_/g, " ")})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="block text-slate-600 font-medium mb-1">Property Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Locality</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Price (₹ INR)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. 11500000"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Bedrooms (BHK)</label>
                      <input
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="3"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Owner / Contact Phone</label>
                      <input
                        type="text"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="+91 98400..."
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Owner Name (if visible)</label>
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Owner name"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-slate-600 font-medium mb-1">Notes & Amenities</label>
                      <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveToProperties}
                      disabled={saving}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
                    >
                      <Building2 className="w-4 h-4" />
                      Save to Verified Inventory
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveAsLead}
                      disabled={saving}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-xl shadow-sm transition-all disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      Save as Owner / Prospect Lead
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

