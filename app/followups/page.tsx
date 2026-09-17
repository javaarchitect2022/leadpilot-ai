"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { StatusBadge } from "@/components/ui/badge";
import {
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Phone,
  MessageSquare,
  Mail,
  Check,
  ExternalLink,
} from "lucide-react";

export default function FollowUpsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"TODAY" | "OVERDUE" | "UPCOMING">("TODAY");
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/followups?filter=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setFollowUps(data.followUps || []);
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
    fetchFollowUps();
  }, [activeTab]);

  const handleComplete = async (id: string) => {
    try {
      await fetch(`/api/followups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      fetchFollowUps();
    } catch {}
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Follow-up Engine"
          subtitle="Proactive multi-channel outreach tracking to maximize conversion velocity"
        />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab("TODAY")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "TODAY"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today's Follow-ups</span>
            </button>

            <button
              onClick={() => setActiveTab("OVERDUE")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "OVERDUE"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Overdue Follow-ups</span>
            </button>

            <button
              onClick={() => setActiveTab("UPCOMING")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "UPCOMING"
                  ? "bg-slate-800 text-white shadow-md shadow-slate-800/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Upcoming Follow-ups</span>
            </button>
          </div>

          {/* Follow-ups List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading follow-ups...</div>
            ) : followUps.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No follow-ups found in this category. All clear!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {followUps.map((f) => (
                  <div key={f.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 font-bold">
                        {f.type === "CALL" ? (
                          <Phone className="w-5 h-5" />
                        ) : f.type === "WHATSAPP" ? (
                          <MessageSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Mail className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/leads/${f.lead?.id}`}
                            className="font-bold text-slate-900 text-sm hover:text-indigo-600 flex items-center gap-1"
                          >
                            <span>{f.lead?.name || "Customer"}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </Link>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {f.lead?.phone}
                          </span>
                          <StatusBadge status={f.lead?.status || "NEW"} />
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          {f.message || "Scheduled follow-up contact"}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Scheduled: {new Date(f.scheduledAt).toLocaleString()} • Assigned: {f.assignedUser?.name || "Unassigned"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {f.lead?.phone && (
                        <a
                          href={`https://wa.me/${f.lead.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 text-xs font-semibold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {f.status === "PENDING" && (
                        <button
                          onClick={() => handleComplete(f.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Done</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

