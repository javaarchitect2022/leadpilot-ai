"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { StatusBadge, PriorityBadge, LeadScoreBadge, ShieldClassificationBadge } from "@/components/ui/badge";
import {
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Sparkles,
  Building,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  Check,
  User,
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  Tag,
  Plus,
} from "lucide-react";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [matchingProperties, setMatchingProperties] = useState<any[]>([]);
  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Reply Generator state
  const [draftReply, setDraftReply] = useState("");
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);

  // AI Follow-up Generator state
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);

  // New note state
  const [noteText, setNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Schedule follow-up state
  const [newFollowUpMsg, setNewFollowUpMsg] = useState("");
  const [newFollowUpDate, setNewFollowUpDate] = useState("");
  const [newFollowUpType, setNewFollowUpType] = useState("WHATSAPP");
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

  const fetchLeadDetails = async () => {
    try {
      const [leadRes, propsRes, teamRes, meRes] = await Promise.all([
        fetch(`/api/leads/${leadId}`),
        fetch(`/api/leads/${leadId}/properties`),
        fetch("/api/team"),
        fetch("/api/auth/me"),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }

      if (leadRes.ok) {
        const leadData = await leadRes.json();
        setLead(leadData.lead);
      } else {
        router.push("/leads");
        return;
      }

      if (propsRes.ok) {
        const propsData = await propsRes.json();
        setMatchingProperties(propsData.matches || []);
      }

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamUsers(teamData.users || []);
      }
    } catch (err) {
      console.error("Failed to load lead details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchLeadDetails();
    } catch {}
  };

  const handleAssignChange = async (newUserId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedUserId: newUserId || null }),
      });
      if (res.ok) fetchLeadDetails();
    } catch {}
  };

  const handleRunAiAnalysis = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leads/${leadId}/analyze`, { method: "POST" });
      if (res.ok) fetchLeadDetails();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReply = async () => {
    setIsGeneratingReply(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/generate-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        setDraftReply(data.reply);
      }
    } catch {
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleGenerateAiFollowUp = async () => {
    setIsGeneratingFollowUp(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/generate-followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpType: newFollowUpType }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewFollowUpMsg(data.suggestedMessage);
        const d = new Date(data.suggestedScheduledDate);
        setNewFollowUpDate(d.toISOString().split("T")[0]);
      }
    } catch {
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowUpDate) return;
    setIsSubmittingFollowUp(true);
    try {
      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          scheduledAt: newFollowUpDate,
          type: newFollowUpType,
          message: newFollowUpMsg,
        }),
      });
      if (res.ok) {
        setNewFollowUpMsg("");
        setNewFollowUpDate("");
        fetchLeadDetails();
      }
    } catch {
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const handleCompleteFollowUp = async (id: string) => {
    try {
      const res = await fetch(`/api/followups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) fetchLeadDetails();
    } catch {}
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(draftReply);
    setCopiedReply(true);
    setTimeout(() => setCopiedReply(false), 2000);
  };

  if (loading || !lead) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar user={currentUser} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-xs">Loading Lead Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={lead.name} subtitle={`Lead ID: ${lead.id} • Source: ${lead.source}`} />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Back & Breadcrumb */}
          <Link
            href="/leads"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Leads</span>
          </Link>

          {/* CRM Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-lg shadow-indigo-600/20">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{lead.name}</h2>
                    <LeadScoreBadge score={lead.leadScore} />
                    {lead.leadClassification && (
                      <ShieldClassificationBadge
                        classification={lead.leadClassification}
                        reason={lead.classificationReason}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {lead.phone}
                    </span>
                    {lead.email && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {lead.email}
                      </span>
                    )}
                    <span>•</span>
                    <span>Locality: {lead.location || "Chennai"}</span>
                  </div>
                </div>
              </div>

              {/* Status and Assignment Selectors */}
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="SITE_VISIT">Site Visit</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Assigned Agent
                  </label>
                  <select
                    value={lead.assignedUserId || ""}
                    onChange={(e) => handleAssignChange(e.target.value)}
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {teamUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="self-end">
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout: Left Details + AI, Right Timeline & Properties */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Lead Analysis Card (Requirement #4) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">AI Lead Qualification & Intent</h3>
                      <p className="text-[11px] text-slate-400">Validated with Zod & grounded heuristics</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRunAiAnalysis}
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    Re-Analyze AI
                  </button>
                </div>

                {lead.aiAnalysis ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <p className="font-semibold text-indigo-950 mb-1">Executive Summary</p>
                      <p className="text-slate-700 leading-relaxed">{lead.aiAnalysis.summary}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Intent</span>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">{lead.aiAnalysis.intent}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Urgency</span>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">{lead.aiAnalysis.urgency}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Recommended Action</span>
                        <p className="font-semibold text-indigo-700 text-xs mt-0.5 truncate" title={lead.aiAnalysis.recommendedNextAction}>
                          {lead.aiAnalysis.recommendedNextAction}
                        </p>
                      </div>
                    </div>

                    {lead.aiAnalysis.missingInformation && lead.aiAnalysis.missingInformation.length > 0 && (
                      <div>
                        <span className="text-slate-500 font-semibold text-[11px] block mb-1.5">
                          Questions to Ask Customer:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {lead.aiAnalysis.missingInformation.map((q: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] border border-slate-200"
                            >
                              ? {q}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-500 mb-3">No AI qualification performed yet.</p>
                    <button
                      onClick={handleRunAiAnalysis}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                    >
                      Run AI Analysis Now
                    </button>
                  </div>
                )}
              </div>

              {/* AI Reply Generator (Requirement #5 & #25) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">AI Reply Generator (WhatsApp Ready)</h3>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Draft Only
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Grounded response referencing only verified properties in your database. No invented prices or false availability.
                </p>

                <div className="space-y-3">
                  {draftReply ? (
                    <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs relative leading-relaxed shadow-inner">
                      {draftReply}
                      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-800">
                        <button
                          onClick={handleCopyReply}
                          className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition-colors"
                        >
                          {copiedReply ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedReply ? "Copied" : "Copy to Clipboard"}</span>
                        </button>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(draftReply)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-500 mb-3">
                        Generate a personalized Indian English WhatsApp draft matching this lead.
                      </p>
                      <button
                        onClick={handleGenerateReply}
                        disabled={isGeneratingReply}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isGeneratingReply ? "Generating Verified Draft..." : "Generate AI WhatsApp Reply"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity & Conversation Timeline */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Activity Timeline & Notes</h3>
                <div className="space-y-4">
                  {lead.activities?.map((act: any) => (
                    <div key={act.id} className="flex items-start gap-3 text-xs border-l-2 border-slate-200 pl-4 py-1">
                      <div className="flex-1">
                        <p className="text-slate-800 font-medium">{act.description}</p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {new Date(act.createdAt).toLocaleString()} • {act.user?.name || "System"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Follow-ups & Matching Properties */}
            <div className="space-y-6">
              {/* Follow-up Schedule Card (Requirement #6) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Follow-up Engine</h3>
                  <button
                    type="button"
                    onClick={handleGenerateAiFollowUp}
                    disabled={isGeneratingFollowUp}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Draft</span>
                  </button>
                </div>

                {/* Follow-up Creation Form */}
                <form onSubmit={handleCreateFollowUp} className="space-y-2 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newFollowUpType}
                      onChange={(e) => setNewFollowUpType(e.target.value)}
                      className="text-xs p-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                    >
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="CALL">Phone Call</option>
                      <option value="EMAIL">Email</option>
                      <option value="TASK">Task</option>
                    </select>
                    <input
                      type="date"
                      required
                      value={newFollowUpDate}
                      onChange={(e) => setNewFollowUpDate(e.target.value)}
                      className="text-xs p-1.5 border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={newFollowUpMsg}
                    onChange={(e) => setNewFollowUpMsg(e.target.value)}
                    placeholder="Follow-up note or AI suggested message"
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingFollowUp || !newFollowUpDate}
                    className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmittingFollowUp ? "Scheduling..." : "Schedule Follow-up"}
                  </button>
                </form>

                {/* Follow-ups List */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                  {lead.followUps?.length === 0 ? (
                    <p className="text-slate-400 text-xs text-center py-3">No follow-ups recorded</p>
                  ) : (
                    lead.followUps?.map((f: any) => (
                      <div
                        key={f.id}
                        className={`p-3 rounded-xl border text-xs ${
                          f.status === "COMPLETED"
                            ? "bg-slate-50 border-slate-100 opacity-60"
                            : "bg-amber-50/40 border-amber-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 text-[11px]">{f.type}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(f.scheduledAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs mb-2">{f.message || "General check-in"}</p>
                        {f.status === "PENDING" && (
                          <button
                            onClick={() => handleCompleteFollowUp(f.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-100/60 px-2 py-0.5 rounded"
                          >
                            <Check className="w-3 h-3" /> Mark Completed
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AI Matched Properties (Requirement #9) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Matching Inventory</h3>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600">
                    {matchingProperties.length} Matches
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Ranked by budget compatibility, BHK, and locality.
                </p>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {matchingProperties.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No matching properties found in current inventory.
                    </p>
                  ) : (
                    matchingProperties.map((m: any) => (
                      <div
                        key={m.property.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-900">{m.property.title}</p>
                            <p className="text-[11px] text-slate-500">
                              {m.property.location} • {m.property.bedrooms}BHK
                            </p>
                          </div>
                          <span className="font-bold text-indigo-600 text-xs whitespace-nowrap">
                            ₹{(m.property.price / 100000).toFixed(0)}L
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-200/50">
                          <span className="text-[11px] font-semibold text-emerald-700">
                            Match: {m.matchScore}%
                          </span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                            {m.matchReasons?.[0]}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

