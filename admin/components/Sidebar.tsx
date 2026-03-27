"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/roles";
import { useTheme } from "@/lib/theme";

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [role, setRole] = useState<string>("SUPER_ADMIN");

  useEffect(() => {
    setRole(localStorage.getItem("admin_role") ?? "SUPER_ADMIN");
  }, []);

  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role as any));
  const isDark = theme === "dark";

  return (
    <aside className={`w-64 min-h-screen flex flex-col transition-colors ${
      isDark ? "bg-slate-950 text-white" : "bg-slate-900 text-white"
    }`}>
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-indigo-400">Payvio</h1>
        <p className="text-xs text-slate-400 mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 py-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 border-r-2 border-indigo-400"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <span className="text-xs text-slate-400">Theme</span>
          <span className="text-sm">
            {isDark ? "🌙 Dark" : "☀️ Light"}
          </span>
        </button>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">{role.replace(/_/g, " ")}</p>
          <button
            onClick={() => {
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_role");
              window.location.href = "/login";
            }}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
