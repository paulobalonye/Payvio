"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

function StatCard({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [corridors, setCorridors] = useState<any[]>([]);

  useEffect(() => {
    api.get("/analytics/overview").then(r => setOverview(r.data.data)).catch(() => {});
    api.get("/analytics/corridors").then(r => setCorridors(r.data.data ?? [])).catch(() => {});
  }, []);

  const fmt = (cents: number) => "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Platform Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Users" value={overview?.user_count?.toLocaleString() ?? "—"} />
        <StatCard label="KYC Pending" value={overview?.kyc_pending?.toString() ?? "—"} />
        <StatCard label="Transfer Volume" value={overview ? fmt(overview.transfer_volume_usd) : "—"} />
        <StatCard label="Transfers" value={overview?.transfer_count?.toLocaleString() ?? "—"} />
        <StatCard label="Success Rate" value={overview ? `${overview.success_rate}%` : "—"} />
        <StatCard label="Revenue" value={overview ? fmt(overview.revenue_usd) : "—"} />
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Top Corridors</h2>
          <button className="text-xs text-indigo-600 font-medium">Export CSV</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="pb-3">Corridor</th>
              <th className="pb-3">Transfers</th>
              <th className="pb-3">Volume (USD)</th>
            </tr>
          </thead>
          <tbody>
            {corridors.map((c, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-3 font-medium">{c.send_currency} → {c.receive_currency}</td>
                <td className="py-3">{c.count}</td>
                <td className="py-3">{fmt(c.volume_usd)}</td>
              </tr>
            ))}
            {corridors.length === 0 && (
              <tr><td colSpan={3} className="py-8 text-center text-slate-400">No transfer data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
