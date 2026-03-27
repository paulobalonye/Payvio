"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const STATUS_FILTERS = ["", "INITIATED", "PROCESSING", "DELIVERED", "FAILED", "REFUNDED"];

export default function TransactionsPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTransfers(); }, [statusFilter]);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await api.get(`/transfers?${params}`);
      setTransfers(data.data ?? []);
    } catch {} finally { setLoading(false); }
  };

  const handleRefund = async (id: string) => {
    const reason = prompt("Refund reason:");
    if (!reason) return;
    await api.post(`/transfers/${id}/refund`, { reason });
    fetchTransfers();
  };

  const fmt = (cents: number) => "$" + (cents / 100).toFixed(2);
  const statusColor = (s: string) => s === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : s === "FAILED" ? "bg-red-50 text-red-700" : s === "REFUNDED" ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Transactions</h1>

      <div className="flex gap-2 mb-6">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition ${statusFilter === s ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 bg-slate-50 border-b">
            <th className="px-4 py-3">ID</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Corridor</th><th className="px-4 py-3">Fee</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Action</th>
          </tr></thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{t.id.slice(0,8)}</td>
                <td className="px-4 py-3">{t.userId.slice(0,8)}</td>
                <td className="px-4 py-3 font-medium">{fmt(t.sendAmount)}</td>
                <td className="px-4 py-3">{t.sendCurrency}→{t.receiveCurrency}</td>
                <td className="px-4 py-3">{fmt(t.fee)}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(t.status)}`}>{t.status}</span></td>
                <td className="px-4 py-3 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {(t.status === "FAILED" || t.status === "PROCESSING") && (
                    <button onClick={() => handleRefund(t.id)} className="text-red-600 text-xs font-medium hover:underline">Refund</button>
                  )}
                </td>
              </tr>
            ))}
            {transfers.length === 0 && !loading && <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No transfers</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
