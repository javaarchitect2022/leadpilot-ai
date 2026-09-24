"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Phone,
  CheckCircle2,
  X,
} from "lucide-react";

export default function TeamPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Invite form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "SALES_USER",
    temporaryPassword: "Password@123",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.users || []);
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
    fetchTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to invite member");

      setIsInviteOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "SALES_USER",
        temporaryPassword: "Password@123",
      });
      fetchTeam();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const roleBadges: Record<string, string> = {
    OWNER: "bg-purple-100 text-purple-800 border-purple-200",
    ADMIN: "bg-blue-100 text-blue-800 border-blue-200",
    MANAGER: "bg-amber-100 text-amber-800 border-amber-200",
    SALES_USER: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Team & Access Control"
          subtitle="Manage agency team members, role-based permissions, and lead assignments"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Organization Members</h3>
              <p className="text-xs text-slate-500">
                {teamMembers.length} active users in your real estate agency.
              </p>
            </div>

            {(currentUser?.role === "OWNER" || currentUser?.role === "ADMIN") && (
              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Member</span>
              </button>
            )}
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">User</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Contact</th>
                    <th className="py-3.5 px-6">Active Leads</th>
                    <th className="py-3.5 px-6">Pending Follow-ups</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">Loading team...</td>
                    </tr>
                  ) : (
                    teamMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {m.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{m.name}</p>
                              <p className="text-[11px] text-slate-500">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              roleBadges[m.role] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {m.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-600">
                          {m.phone || "—"}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-800">
                          {m._count?.assignedLeads || 0}
                        </td>
                        <td className="py-4 px-6 font-bold text-amber-600">
                          {m._count?.assignedFollowUps || 0}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900">Invite Team Member</h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Invited user will receive login credentials to access LeadPilot.
            </p>

            {error && (
              <div className="mb-4 p-2.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ramesh@chennaiprimerealty.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98400 99999"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Assignment *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-medium text-slate-800"
                >
                  <option value="SALES_USER">Sales User (Handle assigned leads and follow-ups)</option>
                  <option value="MANAGER">Manager (Assign leads and view team analytics)</option>
                  <option value="ADMIN">Admin (Full access except billing ownership)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Inviting..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

