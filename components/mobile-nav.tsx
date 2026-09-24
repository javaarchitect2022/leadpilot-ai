"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarCheck, Building2, Menu } from "lucide-react";
import { useNavigation } from "./navigation-context";

export function MobileNav() {
  const pathname = usePathname();
  const { toggleMobile } = useNavigation();

  const primaryItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Leads", href: "/leads", icon: Users },
    { label: "Properties", href: "/properties", icon: Building2 },
    { label: "Follow-ups", href: "/followups", icon: CalendarCheck },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] rounded-lg transition-colors ${
                isActive
                  ? "text-indigo-600 font-semibold"
                  : "text-slate-500 hover:text-slate-900 active:text-indigo-600"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
              <span className="text-[10px] leading-tight tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Menu toggle button */}
        <button
          type="button"
          onClick={toggleMobile}
          className="flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] rounded-lg text-slate-500 hover:text-slate-900 active:text-indigo-600 transition-colors"
          aria-label="Open full menu"
        >
          <Menu className="w-5 h-5 mb-0.5 text-slate-500" />
          <span className="text-[10px] leading-tight tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}

