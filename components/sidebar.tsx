"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Building2,
  BarChart3,
  Bot,
  UserCheck,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink,
  FileCode2,
  X,
} from "lucide-react";
import { useNavigation } from "./navigation-context";
import { MobileNav } from "./mobile-nav";

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    role: string;
    organizationName?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileOpen, closeMobile } = useNavigation();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Leads", href: "/leads", icon: Users },
    { label: "Follow-ups", href: "/followups", icon: CalendarCheck },
    { label: "Properties", href: "/properties", icon: Building2 },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "AI Assistant", href: "/ai-assistant", icon: Bot, badge: "AI" },
    { label: "API Docs", href: "/api-docs", icon: FileCode2, badge: "Swagger" },
    { label: "Team", href: "/team", icon: UserCheck },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const renderNavLinks = (isMobile = false) => (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-2">
        CRM & Operations
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (isMobile) closeMobile();
            }}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-indigo-600/15 text-indigo-400 font-semibold border-l-2 border-indigo-500 pl-2.5"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}

      <div className="pt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-2">
          Tools & Embeds
        </div>
        <Link
          href="/embed-demo"
          target="_blank"
          onClick={() => {
            if (isMobile) closeMobile();
          }}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span>Embed Demo Form</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            Live
          </span>
        </Link>
      </div>
    </nav>
  );

  const renderUserFooter = () => (
    <div className="p-3 border-t border-slate-800 bg-slate-900/50">
      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-700">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user?.name || "Logged User"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.role || "SALES_USER"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Log Out"
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-slate-300 flex-col h-screen sticky top-0 border-r border-slate-800 select-none z-30 shrink-0">
        {/* Brand & Organization */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight leading-none">
                LeadPilot <span className="text-indigo-400 font-semibold">AI</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-medium truncate max-w-[145px]">
                {user?.organizationName || "Chennai Prime Realty"}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        {renderNavLinks(false)}

        {/* Desktop User Footer */}
        {renderUserFooter()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 md:hidden transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-Canvas Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col shadow-2xl border-r border-slate-800 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Drawer Header with Close Button */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight leading-none">
                LeadPilot <span className="text-indigo-400 font-semibold">AI</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-medium truncate max-w-[130px]">
                {user?.organizationName || "Chennai Prime Realty"}
              </p>
            </div>
          </div>
          <button
            onClick={closeMobile}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation Links */}
        {renderNavLinks(true)}

        {/* Mobile User Footer */}
        {renderUserFooter()}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </>
  );
}
