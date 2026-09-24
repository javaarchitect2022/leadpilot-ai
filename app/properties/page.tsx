"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { StatusBadge, LegalStatusBadge } from "@/components/ui/badge";
import { SnapIngestModal } from "@/components/snap-ingest-modal";
import { LegalChecklistModal } from "@/components/legal-checklist-modal";
import {
  Building2,
  Plus,
  Search,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  X,
  Camera,
  Scale,
} from "lucide-react";

export default function PropertiesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [legalStatusFilter, setLegalStatusFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);
  const [selectedLegalProperty, setSelectedLegalProperty] = useState<any | null>(null);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // New property form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    city: "Chennai",
    price: "",
    propertyType: "Apartment",
    bedrooms: "2",
    bathrooms: "2",
    area: "1100",
    status: "AVAILABLE",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        legalStatus: legalStatusFilter,
      });
      const res = await fetch(`/api/properties?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      } else {
        window.location.href = "/login";
      }
    }
    init();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [search, statusFilter, legalStatusFilter]);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area: formData.area ? parseFloat(formData.area) : null,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        fetchProperties();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (p: number) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    return `₹${(p / 100000).toFixed(0)} Lakhs`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Property Management"
          subtitle={`Verified inventory catalog • ${properties.length} active units`}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 overflow-y-auto">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search properties by title, locality, description..."
                className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none shadow-sm font-medium text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <select
                value={legalStatusFilter}
                onChange={(e) => setLegalStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none shadow-sm font-medium text-slate-700"
              >
                <option value="ALL">All Legal Status</option>
                <option value="VERIFIED_CLEAR_TITLE">🛡️ Verified Clear Title</option>
                <option value="IN_REVIEW">⏳ Legal Vetting In Progress</option>
                <option value="PENDING_VERIFICATION">⚪ Pending Legal Review</option>
              </select>

              <button
                onClick={() => setIsSnapModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-purple-600/20"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>📷 Snap & Ingest</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Property</span>
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading verified inventory...</div>
          ) : properties.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No properties found. Add a property to start AI matching!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                        {p.propertyType}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-1">{p.title}</h3>

                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.location}, {p.city}</span>
                    </div>

                    <div className="mb-3">
                      <LegalStatusBadge
                        status={p.legalStatus || "PENDING_VERIFICATION"}
                        score={p.legalScore}
                      />
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {p.description || "Premium verified residential unit ready for site visits."}
                    </p>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                      {p.bedrooms && (
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-slate-400" />
                          <span>{p.bedrooms} BHK</span>
                        </div>
                      )}
                      {p.bathrooms && (
                        <div className="flex items-center gap-1.5">
                          <Bath className="w-4 h-4 text-slate-400" />
                          <span>{p.bathrooms} Baths</span>
                        </div>
                      )}
                      {p.area && (
                        <div className="flex items-center gap-1.5">
                          <Maximize2 className="w-4 h-4 text-slate-400" />
                          <span>{p.area} sqft</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Offer Price
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {formatPrice(p.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedLegalProperty(p);
                        setIsLegalModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 rounded-xl text-xs font-semibold shadow-2xs transition-all"
                    >
                      <Scale className="w-3.5 h-3.5 text-amber-600" />
                      <span>Legal Vetting</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900">Add Inventory Unit</h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Verified property listing will be referenced by AI without hallucinations.
            </p>

            <form onSubmit={handleCreateProperty} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Radiance Smartville 2BHK"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Locality *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. OMR, Thoraipakkam"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Chennai"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="6800000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Plot">Plot</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    placeholder="2"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    placeholder="2"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Area (sqft)</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="1100"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key features, amenities, builder details..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snap & Ingest AI Camera Modal */}
      <SnapIngestModal
        isOpen={isSnapModalOpen}
        onClose={() => setIsSnapModalOpen(false)}
        onSuccess={fetchProperties}
      />

      {/* 10-Point Legal Due-Diligence Checklist Modal */}
      <LegalChecklistModal
        isOpen={isLegalModalOpen}
        onClose={() => {
          setIsLegalModalOpen(false);
          setSelectedLegalProperty(null);
        }}
        property={selectedLegalProperty}
        onSuccess={fetchProperties}
      />
    </div>
  );
}

