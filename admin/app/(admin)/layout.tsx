"use client";

import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto bg-slate-50 dark:bg-slate-900 transition-colors">{children}</main>
    </div>
  );
}
