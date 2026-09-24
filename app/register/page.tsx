"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Building, MapPin, User, Mail, Lock, Phone, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    businessType: "REAL_ESTATE",
    city: "Chennai",
    country: "India",
    phone: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>14-Day Free Trial • Multi-Tenant Architecture</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Launch Your Agency on <span className="text-indigo-400">LeadPilot AI</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Automate qualification, intelligent replies, and follow-ups.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="border-b border-slate-800 pb-3 mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                1. Agency Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name *</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Apex Realty Partners"
                    className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:border-indigo-500 outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Business Type</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:border-indigo-500 outline-none"
                >
                  <option value="REAL_ESTATE">Real Estate Agency</option>
                  <option value="INSURANCE">Insurance Advisory (Future)</option>
                  <option value="CLINIC">Healthcare Clinic (Future)</option>
                  <option value="EDUCATION">Education Consultancy (Future)</option>
                  <option value="INTERIOR_DESIGN">Interior Design (Future)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Chennai"
                    className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:border-indigo-500 outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  readOnly
                  value="India"
                  className="w-full text-sm px-3 py-2.5 bg-slate-950/60 border border-slate-800 text-slate-400 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="border-b border-slate-800 pb-3 pt-3 mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                2. Owner Account
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Suresh Kumar"
                    className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:border-indigo-500 outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98400 00000"
                    className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:border-indigo-500 outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="suresh@apexrealty.com"
                    className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:border-indigo-500 outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Create Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:border-indigo-500 outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <span>{loading ? "Creating Organization..." : "Create Organization & Start Trial"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

