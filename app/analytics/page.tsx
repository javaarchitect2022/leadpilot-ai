"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  DollarSign,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function AnalyticsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, aRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/analytics"),
        ]);
        if (meRes.ok) {
          const d = await meRes.json();
          setCurrentUser(d.user);
        } else {
          window.location.href = "/login";
        }
        if (aRes.ok) {
          const ad = await aRes.json();
          setAnalytics(ad);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatLakhs = (val: number) => {
    if (!val) return "₹0";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Conversion & Channel Analytics"
          subtitle="Multi-channel acquisition ROI, funnel velocity, and financial conversion tracking"
        />

        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {/* Top Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                <span>Total Leads Captured</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {analytics?.metrics?.totalLeads || 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">Across 8 acquisition channels</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                <span>Active Pipeline Value</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {analytics ? formatLakhs(analytics.metrics.estimatedPipelineValue) : "..."}
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                Converted: {analytics ? formatLakhs(analytics.metrics.convertedValue) : "..."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                <span>AI Automated Touchpoints</span>
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-3xl font-extrabold text-indigo-600">
                {(analytics?.metrics?.leadsAnalyzed || 0) + (analytics?.metrics?.aiRepliesGenerated || 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Scorings + Verified WhatsApp drafts</p>
            </div>
          </div>

          {/* Lead Sources Performance Table (Requirement #10) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Channel Conversion Performance</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Performance comparison across all captured inbound channels.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                Top Channel: WhatsApp (6.7%)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-6">Channel Source</th>
                    <th className="py-3 px-6">Total Inbound</th>
                    <th className="py-3 px-6">Conversions</th>
                    <th className="py-3 px-6">Conversion Rate</th>
                    <th className="py-3 px-6">Performance Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {analytics?.sourcePerformance?.map((sp: any) => (
                    <tr key={sp.source} className="hover:bg-slate-50">
                      <td className="py-4 px-6 font-bold text-slate-900">{sp.source}</td>
                      <td className="py-4 px-6 text-slate-700">{sp.total}</td>
                      <td className="py-4 px-6 text-emerald-600 font-bold">{sp.converted}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                          {sp.conversionRate}
                        </span>
                      </td>
                      <td className="py-4 px-6 w-56">
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, sp.conversionRateNum * 12)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Funnel Stage Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-1">CRM Funnel Breakdown</h3>
            <p className="text-xs text-slate-500 mb-6">Volume of leads across qualification lifecycle stages</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
              {analytics?.statusDistribution?.map((sd: any) => (
                <div key={sd.status} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    {sd.status.replace(/_/g, " ")}
                  </span>
                  <p className="text-lg font-extrabold text-slate-900 mt-1">{sd.count}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

