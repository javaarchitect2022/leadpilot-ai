"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { StatusBadge, PriorityBadge, LeadScoreBadge, ShieldClassificationBadge } from "@/components/ui/badge";
import { AddLeadModal } from "@/components/add-lead-modal";
import { CsvImportModal } from "@/components/csv-import-modal";
import {
  Search,
  Plus,
  Upload,
  Filter,
  ArrowUpDown,
  Phone,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";

export default function LeadsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // Team members for modal and assignment
  const [teamUsers, setTeamUsers] = useState<any[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Bulk actions selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        source: sourceFilter,
        urgency: urgencyFilter,
        sortBy,
        order,
        page: page.toString(),
        limit: "20",
      });

      const res = await fetch(`/api/leads?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const [meRes, teamRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/team"),
        ]);
        if (meRes.ok) {
          const d = await meRes.json();
          setCurrentUser(d.user);
        } else {
          window.location.href = "/login";
          return;
        }
        if (teamRes.ok) {
          const td = await teamRes.json();
          setTeamUsers(td.users || []);
        }
      } catch {}
    }
    init();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, sourceFilter, urgencyFilter, sortBy, order, page]);

  const toggleSelectLead = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((i) => i !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const selectAllCurrentPage = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedLeadIds.length === 0) return;
    try {
      await Promise.all(
        selectedLeadIds.map((id) =>
          fetch(`/api/leads/${id}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus, note: "Bulk status update" }),
          })
        )
      );
      setSelectedLeadIds([]);
      fetchLeads();
    } catch (err) {
      console.error("Bulk update failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Lead Management"
          subtitle={`Showing ${leads.length} of ${total} leads • Qualified and tracked`}
        />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search leads by name, phone, locality, requirement..."
                className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 shadow-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsCsvModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lead</span>
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider pl-1">
              Filters:
            </span>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="SITE_VISIT">Site Visit</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Sources</option>
              <option value="WEBSITE">Website</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="GOOGLE_FORM">Google Form</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="PHONE">Phone</option>
              <option value="MANUAL">Manual</option>
              <option value="CSV">CSV</option>
            </select>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => {
                setUrgencyFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Urgency</option>
              <option value="HIGH">High Urgency</option>
              <option value="MEDIUM">Medium Urgency</option>
              <option value="LOW">Low Urgency</option>
            </select>

            {/* Sort Toggle */}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-slate-400 text-xs">Sort:</span>
              <button
                onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
                className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>{order === "desc" ? "Newest First" : "Oldest First"}</span>
              </button>
            </div>
          </div>

          {/* Bulk Action Strip */}
          {selectedLeadIds.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex items-center justify-between animate-in fade-in duration-100 text-xs">
              <span className="font-semibold text-indigo-900">
                {selectedLeadIds.length} lead(s) selected
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Mark as:</span>
                <button
                  onClick={() => handleBulkStatusChange("CONTACTED")}
                  className="px-2.5 py-1 bg-white border border-indigo-200 hover:bg-indigo-100 rounded text-slate-800 font-medium"
                >
                  Contacted
                </button>
                <button
                  onClick={() => handleBulkStatusChange("QUALIFIED")}
                  className="px-2.5 py-1 bg-white border border-indigo-200 hover:bg-indigo-100 rounded text-slate-800 font-medium"
                >
                  Qualified
                </button>
                <button
                  onClick={() => handleBulkStatusChange("SITE_VISIT")}
                  className="px-2.5 py-1 bg-white border border-indigo-200 hover:bg-indigo-100 rounded text-slate-800 font-medium"
                >
                  Site Visit
                </button>
                <button
                  onClick={() => handleBulkStatusChange("CONVERTED")}
                  className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded font-semibold"
                >
                  Converted
                </button>
              </div>
            </div>
          )}

          {/* Leads Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-8">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.length > 0 && selectedLeadIds.length === leads.length}
                        onChange={selectAllCurrentPage}
                        className="rounded text-indigo-600"
                      />
                    </th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">AI Score</th>
                    <th className="py-3 px-4">Requirement & Locality</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Agent</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                        Loading verified leads...
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                        No leads found matching your criteria. Try adjusting filters or adding a new lead.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          selectedLeadIds.includes(lead.id) ? "bg-indigo-50/30" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.includes(lead.id)}
                            onChange={() => toggleSelectLead(lead.id)}
                            className="rounded text-indigo-600"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1 group"
                          >
                            <span>{lead.name}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
                          </Link>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{lead.phone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <LeadScoreBadge score={lead.leadScore} />
                            {lead.leadClassification && (
                              <ShieldClassificationBadge
                                classification={lead.leadClassification}
                                reason={lead.classificationReason}
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="truncate font-medium text-slate-800">
                            {lead.requirement || "General Property Enquiry"}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {lead.location || "Chennai"} • {lead.bedrooms ? `${lead.bedrooms}BHK` : "Any BHK"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {lead.budgetMax
                            ? lead.budgetMax >= 10000000
                              ? `₹${(lead.budgetMax / 10000000).toFixed(2)} Cr`
                              : `₹${(lead.budgetMax / 100000).toFixed(0)} Lakhs`
                            : "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            {lead.source}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {lead.assignedUser ? (
                            <span className="font-medium text-slate-800">{lead.assignedUser.name}</span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors"
                          >
                            <span>Open CRM</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLeadAdded={fetchLeads}
        teamUsers={teamUsers}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportComplete={fetchLeads}
      />
    </div>
  );
}

