"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import {
  Settings,
  Bot,
  CreditCard,
  Building,
  Code,
  CheckCircle2,
  Sparkles,
  Save,
  Copy,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"BUSINESS" | "AI" | "SUBSCRIPTION" | "EMBED">("BUSINESS");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings State
  const [organization, setOrganization] = useState<any>(null);
  const [aiSettings, setAiSettings] = useState<any>({
    preferredAiProvider: "GEMINI",
    aiResponseTone: "Professional and consultative Indian real estate advisor",
    businessDescription: "",
    defaultLanguage: "English (Indian)",
  });
  const [subscription, setSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const fetchSettings = async () => {
    try {
      const [meRes, sRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/settings"),
      ]);

      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      } else {
        window.location.href = "/login";
        return;
      }

      if (sRes.ok) {
        const sd = await sRes.json();
        setOrganization(sd.organization);
        if (sd.settings) {
          setAiSettings({
            preferredAiProvider: sd.settings.preferredAiProvider || "GEMINI",
            aiResponseTone: sd.settings.aiResponseTone || "",
            businessDescription: sd.settings.businessDescription || "",
            defaultLanguage: sd.settings.defaultLanguage || "English (Indian)",
          });
        }
        setSubscription(sd.subscription);
        setAvailablePlans(sd.availablePlans || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: organization.name,
          city: organization.city,
          phone: organization.phone,
          email: organization.email,
          ...aiSettings,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpgradePlan = async (planTier: string) => {
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier, billingCycle: "MONTHLY" }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
        alert(`Successfully updated subscription to ${planTier} plan!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const embedSnippet = `<script src="${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/widget/leadpilot.js" data-org="${organization?.id || "YOUR_ORG_ID"}"></script>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Organization Settings"
          subtitle="Configure business details, AI models, subscription billing, and web lead capture"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 overflow-y-auto max-w-5xl">
          {/* Settings Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("BUSINESS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "BUSINESS"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Business Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("AI")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "AI"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Configuration</span>
            </button>

            <button
              onClick={() => setActiveTab("SUBSCRIPTION")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "SUBSCRIPTION"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Subscription & Plans</span>
            </button>

            <button
              onClick={() => setActiveTab("EMBED")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "EMBED"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Lead Widget Embed</span>
            </button>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings saved successfully.</span>
            </div>
          )}

          {/* Tab 1: Business Profile */}
          {activeTab === "BUSINESS" && organization && (
            <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Agency Information</h3>
              <p className="text-slate-500 text-xs mb-4">
                Basic business profile used in outbound communications and AI responses.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Agency Name</label>
                  <input
                    type="text"
                    value={organization.name}
                    onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={organization.city}
                    onChange={(e) => setOrganization({ ...organization, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Phone</label>
                  <input
                    type="text"
                    value={organization.phone || ""}
                    onChange={(e) => setOrganization({ ...organization, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={organization.email || ""}
                    onChange={(e) => setOrganization({ ...organization, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: AI Settings */}
          {activeTab === "AI" && (
            <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Bot className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-sm">AI Engine Configuration</h3>
              </div>
              <p className="text-slate-500 text-xs mb-4">
                Configure preferred AI LLM provider, prompt instructions, and response tone.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred AI Provider</label>
                  <select
                    value={aiSettings.preferredAiProvider}
                    onChange={(e) => setAiSettings({ ...aiSettings, preferredAiProvider: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-semibold text-slate-800"
                  >
                    <option value="GEMINI">Google Gemini (Default)</option>
                    <option value="OPENAI">OpenAI GPT-4o</option>
                    <option value="CLAUDE">Anthropic Claude 3.5</option>
                    <option value="MOCK">Mock Provider (Offline / Testing)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Language</label>
                  <input
                    type="text"
                    value={aiSettings.defaultLanguage}
                    onChange={(e) => setAiSettings({ ...aiSettings, defaultLanguage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">AI Response Tone & Persona</label>
                <input
                  type="text"
                  value={aiSettings.aiResponseTone}
                  onChange={(e) => setAiSettings({ ...aiSettings, aiResponseTone: e.target.value })}
                  placeholder="e.g. Professional, consultative Indian real estate advisor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Context for AI</label>
                <textarea
                  rows={3}
                  value={aiSettings.businessDescription}
                  onChange={(e) => setAiSettings({ ...aiSettings, businessDescription: e.target.value })}
                  placeholder="Describe your firm's specialties, primary localities, and unique value proposition..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save AI Preferences"}</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Subscription & Billing Plans (Requirement #14) */}
          {activeTab === "SUBSCRIPTION" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                    Current Active Plan
                  </span>
                  <h3 className="text-2xl font-bold mt-1">
                    {subscription?.plan || "GROWTH"} Plan
                  </h3>
                  <p className="text-xs text-indigo-200 mt-1">
                    Status: <strong className="text-emerald-400">{subscription?.status || "ACTIVE"}</strong> • Limit: {subscription?.leadLimit || 5000} leads/month
                  </p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/15 text-xs">
                  <span>Billing Cycle: <strong>{subscription?.billingCycle || "MONTHLY"}</strong></span>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Starter */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">STARTER</h4>
                    <p className="text-xs text-slate-500 mt-1">For independent brokers</p>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold text-slate-900">₹999</span>
                      <span className="text-xs text-slate-500"> / month</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Up to 500 leads / month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>AI Lead Scoring</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Up to 3 Users</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleUpgradePlan("STARTER")}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
                  >
                    Select Starter
                  </button>
                </div>

                {/* Growth */}
                <div className="bg-white rounded-2xl p-6 border-2 border-indigo-600 shadow-lg relative flex flex-col justify-between">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">GROWTH</h4>
                    <p className="text-xs text-slate-500 mt-1">For growing real estate agencies</p>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold text-slate-900">₹2,499</span>
                      <span className="text-xs text-slate-500"> / month</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Up to 5,000 leads / month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>AI Reply Generator</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Property Matching Engine</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Unlimited Users & Roles</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleUpgradePlan("GROWTH")}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20"
                  >
                    Current Plan
                  </button>
                </div>

                {/* Business */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">BUSINESS</h4>
                    <p className="text-xs text-slate-500 mt-1">For multi-office brokerage firms</p>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold text-slate-900">₹4,999</span>
                      <span className="text-xs text-slate-500"> / month</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Unlimited leads</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Website Lead Capture Widget</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>WhatsApp Cloud API Integration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Dedicated Support</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleUpgradePlan("BUSINESS")}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Upgrade to Business
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Lead Widget Embed (Requirement #12) */}
          {activeTab === "EMBED" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Code className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Website Lead Capture Widget</h3>
              </div>
              <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                Add an interactive "Enquire Now" popup to your agency website. Inbound enquiries are automatically captured into your LeadPilot CRM and qualified using AI.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Embeddable JavaScript Snippet
                </label>
                <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl relative overflow-x-auto">
                  <code>{embedSnippet}</code>
                  <button
                    onClick={copySnippet}
                    className="absolute top-3 right-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1"
                  >
                    {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Test Live Embed Demo</p>
                  <p className="text-[11px] text-slate-500">
                    Preview how the widget appears on an actual real estate property website.
                  </p>
                </div>
                <a
                  href="/embed-demo"
                  target="_blank"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Open Live Demo
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

