"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import {
  Users,
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Building,
  Calendar,
  IndianRupee,
  ArrowUpRight,
  Plus,
  Bot,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, analyticsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/analytics"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
        } else {
          window.location.href = "/login";
          return;
        }

        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          setAnalytics(aData);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatLakhs = (val: number) => {
    if (!val) return "₹0";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f43f5e"];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Executive Dashboard"
          subtitle="Real-time pipeline overview, AI qualification activity & conversion metrics"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 sm:space-y-8 overflow-y-auto">
          {/* Top Row: Financial & AI Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pipeline Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Active Pipeline Value
                </span>
                <span className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </span>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight">
                {analytics ? formatLakhs(analytics.metrics.estimatedPipelineValue) : "..."}
              </h3>
              <p className="text-xs text-indigo-200/70 mt-1">
                Estimated value across qualified & negotiating enquiries
              </p>

              <div className="mt-6 pt-4 border-t border-indigo-800/60 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-indigo-300">Converted Value</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {analytics ? formatLakhs(analytics.metrics.convertedValue) : "..."}
                  </p>
                </div>
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
                >
                  <span>Full report</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* AI Intelligence Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">AI Copilot Activity</h4>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Automated lead scoring, intent classification, and verified inventory replies.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500">Enquiries Analyzed</p>
                    <p className="text-xl font-bold text-slate-900 mt-0.5">
                      {analytics?.metrics?.leadsAnalyzed || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500">Replies Drafted</p>
                    <p className="text-xl font-bold text-indigo-600 mt-0.5">
                      {analytics?.metrics?.aiRepliesGenerated || 0}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/ai-assistant"
                className="mt-4 w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>Launch Conversational Assistant</span>
              </Link>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Quick Actions</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Streamline sales team workflows and outreach.
                </p>
                <div className="space-y-2">
                  <Link
                    href="/leads"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-xs font-semibold text-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Manage All Leads
                    </span>
                    <span className="text-slate-400">&rarr;</span>
                  </Link>
                  <Link
                    href="/followups"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all text-xs font-semibold text-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      View Due Follow-ups ({analytics?.metrics?.followUpsDue || 0})
                    </span>
                    <span className="text-slate-400">&rarr;</span>
                  </Link>
                  <Link
                    href="/properties"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-xs font-semibold text-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-600" />
                      Browse Properties
                    </span>
                    <span className="text-slate-400">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 8 Primary KPI Metric Cards (Requirement #2) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Today's Leads</span>
                <Calendar className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {analytics?.metrics?.todayLeads || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Captured in last 24h</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Hot Leads (75+)</span>
                <Flame className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-rose-600 mt-2">
                {analytics?.metrics?.hotLeads || 0}
              </p>
              <p className="text-[11px] text-rose-500/80 mt-0.5">High purchase intent</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Follow-ups Due</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-2">
                {analytics?.metrics?.followUpsDue || 0}
              </p>
              <p className="text-[11px] text-amber-500/80 mt-0.5">Awaiting agent call/chat</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Site Visits</span>
                <Building className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {analytics?.metrics?.siteVisits || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Scheduled or completed</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>New Leads</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {analytics?.metrics?.newLeads || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Uncontacted in queue</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Warm Leads</span>
                <Sparkles className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {analytics?.metrics?.warmLeads || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Score 50-74</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Converted Leads</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                {analytics?.metrics?.convertedLeads || 0}
              </p>
              <p className="text-[11px] text-emerald-600/80 mt-0.5">Deal closed</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Lost Leads</span>
                <span className="text-xs text-slate-400">×</span>
              </div>
              <p className="text-2xl font-bold text-slate-600 mt-2">
                {analytics?.metrics?.lostLeads || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Inactive or dropped</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leads Trend by Day */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Leads Trend (Last 14 Days)</h4>
                  <p className="text-xs text-slate-500">Daily inbound enquiries</p>
                </div>
              </div>
              <div className="h-64 w-full">
                {analytics?.leadsByDay && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.leadsByDay}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Conversion Performance by Source (Requirement #10) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Conversion Rate by Source</h4>
                  <p className="text-xs text-slate-500">Track channel ROI and effectiveness</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Lead Source</th>
                      <th className="py-2.5 px-3">Total Leads</th>
                      <th className="py-2.5 px-3">Converted</th>
                      <th className="py-2.5 px-3">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics?.sourcePerformance?.map((sp: any) => (
                      <tr key={sp.source} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {sp.source}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{sp.total}</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-semibold">{sp.converted}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${Math.min(100, sp.conversionRateNum * 8)}%` }}
                              />
                            </div>
                            <span className="font-bold text-indigo-600">{sp.conversionRate}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

