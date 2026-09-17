"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Sparkles, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function EmbedDemoPage() {
  const [orgId, setOrgId] = useState<string>("");

  useEffect(() => {
    async function loadOrg() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const d = await res.json();
          setOrgId(d.user?.organizationId || "");
        }
      } catch {}
    }
    loadOrg();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Simulation Top Bar */}
      <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">
            Live Preview: LeadPilot AI — Production-Ready Multi-Tenant SaaS Platform
          </span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to LeadPilot CRM</span>
        </Link>
      </div>

      {/* Simulated External Agency Landing Page */}
      <div className="max-w-5xl mx-auto py-12 px-6">
        <header className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Skyline Residences • Chennai
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Luxury 2, 3 & 4 BHK Coastal Living on East Coast Road
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-indigo-600 block">Starting ₹1.45 Cr</span>
            <span className="text-[11px] text-slate-400">RERA Approved: TN/29/Building/0192</span>
          </div>
        </header>

        {/* Hero Section */}
        <div className="my-8 bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-lg space-y-4">
            <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 rounded-full text-xs font-bold border border-indigo-400/30">
              New Phase Launch
            </span>
            <h2 className="text-3xl font-extrabold leading-tight">
              Wake Up to Unobstructed Ocean Panoramas
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Designed with bespoke Italian marble, infinity sky pool, and private access to pristine beaches. Book your VIP private preview today.
            </p>
          </div>
        </div>

        {/* Demo explanation banner */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">How This Works</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Notice the floating <strong>"💬 Enquire Property"</strong> button at the bottom-right of this page. It is injected via a 1-line script tag. When visitors fill the popup form:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
            <li>Submissions post securely to your LeadPilot API with anti-spam honeypot protection.</li>
            <li>LeadPilot immediately triggers AI qualification, scores the enquiry, and alerts your sales agents.</li>
            <li>The lead instantly reflects on your Dashboard and Leads CRM.</li>
          </ul>
        </div>
      </div>

      {/* Dynamic Widget Script Injection */}
      {orgId && (
        <Script
          src={`/api/widget/leadpilot.js`}
          data-org={orgId}
          strategy="lazyOnload"
        />
      )}
    </div>
  );
}

