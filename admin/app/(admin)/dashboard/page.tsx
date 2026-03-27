"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function StatCard({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
    </div>
  );
}

const DATE_RANGES = [
  { label: "Today", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [corridors, setCorridors] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState(30);

  const fetchData = useCallback(async () => {
    const from = new Date(Date.now() - dateRange * 86400000).toISOString();
    const to = new Date().toISOString();
    try {
      const [ov, cor, vol] = await Promise.all([
        api.get("/analytics/overview"),
        api.get("/analytics/corridors"),
        api.get(`/analytics/volume?from=${from}&to=${to}`),
      ]);
      setOverview(ov.data.data);
      setCorridors(cor.data.data ?? []);
      setVolumeData(vol.data.data ?? []);
    } catch {}
  }, [dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const fmt = (cents: number) => "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });

  const exportCSV = () => {
    const header = "Corridor,Transfers,Volume USD\n";
    const rows = corridors.map(c => `${c.send_currency}-${c.receive_currency},${c.count},${(c.volume_usd / 100).toFixed(2)}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `corridors-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  const chartData = {
    labels: volumeData.map(d => d.date),
    datasets: [{
      label: "Transfer Volume (USD)",
      data: volumeData.map(d => d.volume / 100),
      backgroundColor: "rgba(79, 70, 229, 0.6)",
      borderRadius: 6,
    }],
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
        <div className="flex gap-2">
          {DATE_RANGES.map(r => (
            <button key={r.days} onClick={() => setDateRange(r.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${dateRange === r.days ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300 dark:border-slate-600"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Users" value={overview?.user_count?.toLocaleString() ?? "—"} />
        <StatCard label="KYC Pending" value={overview?.kyc_pending?.toString() ?? "—"} />
        <StatCard label="Transfer Volume" value={overview ? fmt(overview.transfer_volume_usd) : "—"} />
        <StatCard label="Transfers" value={overview?.transfer_count?.toLocaleString() ?? "—"} />
        <StatCard label="Success Rate" value={overview ? `${overview.success_rate}%` : "—"} />
        <StatCard label="Revenue" value={overview ? fmt(overview.revenue_usd) : "—"} />
      </div>

      {/* Volume Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Transfer Volume</h2>
        <div className="h-64">
          {volumeData.length > 0 ? (
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">No volume data for this period</div>
          )}
        </div>
      </div>

      {/* Corridors Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Corridors</h2>
          <button onClick={exportCSV} className="text-xs text-indigo-600 font-medium hover:underline">Export CSV</button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 border-b"><th className="pb-3">Corridor</th><th className="pb-3">Transfers</th><th className="pb-3">Volume (USD)</th></tr></thead>
          <tbody>
            {corridors.map((c, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                <td className="py-3 font-medium">{c.send_currency} → {c.receive_currency}</td>
                <td className="py-3">{c.count}</td>
                <td className="py-3">{fmt(c.volume_usd)}</td>
              </tr>
            ))}
            {corridors.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-slate-400">No transfer data yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
