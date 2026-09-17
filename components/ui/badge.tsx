import React from "react";

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-700 border-blue-200/80",
    CONTACTED: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    QUALIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    FOLLOW_UP: "bg-amber-50 text-amber-700 border-amber-200/80",
    SITE_VISIT: "bg-purple-50 text-purple-700 border-purple-200/80",
    NEGOTIATION: "bg-cyan-50 text-cyan-700 border-cyan-200/80",
    CONVERTED: "bg-green-100 text-green-800 border-green-300 font-semibold",
    LOST: "bg-rose-50 text-rose-700 border-rose-200/80",
    AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    RESERVED: "bg-amber-50 text-amber-700 border-amber-200",
    SOLD: "bg-slate-100 text-slate-700 border-slate-200",
    INACTIVE: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const defaultStyle = "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
        styles[status] || defaultStyle
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    URGENT: "bg-rose-100 text-rose-800 border-rose-200 font-semibold",
    HIGH: "bg-orange-50 text-orange-700 border-orange-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    LOW: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
        styles[priority] || "bg-slate-100 text-slate-600"
      }`}
    >
      {priority}
    </span>
  );
}

export function LeadScoreBadge({ score }: { score: number }) {
  let color = "bg-slate-100 text-slate-700 border-slate-200";
  let label = "Cold";

  if (score >= 80) {
    color = "bg-rose-50 text-rose-700 border-rose-200 font-bold";
    label = "🔥 Hot";
  } else if (score >= 60) {
    color = "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
    label = "⚡ Warm";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${color}`}>
      <span>{label}</span>
      <span className="font-mono">({score})</span>
    </span>
  );
}

export function ShieldClassificationBadge({
  classification,
  reason,
}: {
  classification: string;
  reason?: string;
}) {
  const configs: Record<string, { label: string; icon: string; style: string }> = {
    GENUINE_BUYER: {
      label: "Verified Buyer",
      icon: "🛡️",
      style: "bg-emerald-50 text-emerald-800 border-emerald-300",
    },
    COMPETITOR_BROKER: {
      label: "Co-Broker / CP",
      icon: "⚠️",
      style: "bg-amber-50 text-amber-800 border-amber-300",
    },
    SUSPECTED_SPAM: {
      label: "Suspected Spam",
      icon: "🚫",
      style: "bg-rose-50 text-rose-800 border-rose-300",
    },
    GENERAL_ENQUIRY: {
      label: "General Enquiry",
      icon: "💬",
      style: "bg-blue-50 text-blue-800 border-blue-300",
    },
  };

  const current = configs[classification] || configs.GENUINE_BUYER;

  return (
    <span
      title={reason || current.label}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${current.style}`}
    >
      <span>{current.icon}</span>
      <span>{current.label}</span>
    </span>
  );
}

export function LegalStatusBadge({
  status,
  score,
}: {
  status: string;
  score?: number;
}) {
  const configs: Record<string, { label: string; icon: string; style: string }> = {
    VERIFIED_CLEAR_TITLE: {
      label: "Verified Clear Title",
      icon: "🛡️",
      style: "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold",
    },
    IN_REVIEW: {
      label: "Legal Vetting In Progress",
      icon: "⏳",
      style: "bg-amber-50 text-amber-800 border-amber-300 font-semibold",
    },
    PENDING_VERIFICATION: {
      label: "Pending Legal Review",
      icon: "⚪",
      style: "bg-slate-100 text-slate-700 border-slate-300",
    },
    DISPUTE_FLAGGED: {
      label: "Title Dispute Flagged",
      icon: "⚠️",
      style: "bg-rose-50 text-rose-800 border-rose-300 font-bold",
    },
  };

  const current = configs[status] || configs.PENDING_VERIFICATION;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border shadow-xs ${current.style}`}
    >
      <span>{current.icon}</span>
      <span>{current.label}</span>
      {score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 bg-white/70 rounded-md font-mono text-[10px]">
          {score}/10
        </span>
      )}
    </span>
  );
}

