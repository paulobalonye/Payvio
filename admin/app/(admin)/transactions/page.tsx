"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const STATUS_FILTERS = ["", "INITIATED", "PROCESSING", "DELIVERED", "FAILED", "REFUNDED"];

export default function TransactionsPage() {
  const [tab, setTab] = useState<"transfers" | "aml">("transfers");
  const [transfers, setTransfers] = useState<any[]>([]);
  const [amlFlags, setAmlFlags] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { tab === "transfers" ? fetchTransfers() : fetchAmlFlags(); }, [statusFilter, tab]);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await api.get(`/transfers?${params}`);
      let results = data.data ?? [];
      if (search) {
        const q = search.toLowerCase();
        results = results.filter((t: any) => t.id.toLowerCase().includes(q) || t.userId.toLowerCase().includes(q));
      }
      setTransfers(results);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchAmlFlags = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/aml/flags");
      setAmlFlags(data.data ?? []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleRefund = async (id: string) => {
    const reason = prompt("Refund reason:");
    if (!reason) return;
    await api.post(`/transfers/${id}/refund`, { reason });
    fetchTransfers();
  };

  const handleRetry = async (id: string) => {
    const reason = prompt("Retry reason:");
    if (!reason) return;
    await api.post(`/transfers/${id}/retry`, { reason });
    fetchTransfers();
  };

  const handleAmlAction = async (id: string, action: string) => {
    const reason = prompt(`${action} reason:`);
    if (!reason) return;
    await api.post(`/aml/${id}/action`, { action, reason });
    fetchAmlFlags();
  };

  const exportCSV = () => {
    const header = "ID,User,Amount,Corridor,Fee,Status,Date\n";
    const rows = transfers.map((t: any) => `${t.id},${t.userId},${t.sendAmount / 100},${t.sendCurrency}-${t.receiveCurrency},${t.fee / 100},${t.status},${new Date(t.createdAt).toISOString()}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "transfers.csv"; a.click();
  };

  const fmt = (cents: number) => "$" + (cents / 100).toFixed(2);
  const statusColor = (s: string) => s === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : s === "FAILED" ? "bg-red-50 text-red-700" : s === "REFUNDED" ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700";
  const riskColor = (score: number) => score > 80 ? "bg-red-100 text-red-700" : score > 50 ? "bg-amber-100 text-amber-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab("transfers")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "transfers" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300 dark:border-slate-600"}`}>Transfers</button>
          <button onClick={() => setTab("aml")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "aml" ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-300 dark:border-slate-600"}`}>
            AML Flags {amlFlags.length > 0 && <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs">{amlFlags.length}</span>}
          </button>
        </div>
      </div>

      {tab === "transfers" && (
        <>
          <div className="flex gap-3 mb-4">
            <input value={search} onChange={(e) => { setSearch(e.target.value); }} onKeyDown={(e) => e.key === "Enter" && fetchTransfers()}
              placeholder="Search by transfer ID or user ID..." className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm outline-none" />
            <button onClick={exportCSV} className="px-4 py-2 bg-white border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-600 font-medium">Export CSV</button>
          </div>
          <div className="flex gap-2 mb-6">
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition ${statusFilter === s ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300 dark:border-slate-600"}`}>
                {s || "All"}
              </button>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 bg-slate-50 dark:bg-slate-900 border-b">
                <th className="px-4 py-3">ID</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Corridor</th><th className="px-4 py-3">Fee</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-3 font-mono text-xs">{t.id.slice(0,8)}</td>
                    <td className="px-4 py-3">{t.userId.slice(0,8)}</td>
                    <td className="px-4 py-3 font-medium">{fmt(t.sendAmount)}</td>
                    <td className="px-4 py-3">{t.sendCurrency}→{t.receiveCurrency}</td>
                    <td className="px-4 py-3">{fmt(t.fee)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(t.status)}`}>{t.status}</span></td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 flex gap-2">
                      {t.status === "FAILED" && <button onClick={() => handleRetry(t.id)} className="text-indigo-600 text-xs font-medium">Retry</button>}
                      {(t.status === "FAILED" || t.status === "PROCESSING") && <button onClick={() => handleRefund(t.id)} className="text-red-600 text-xs font-medium">Refund</button>}
                    </td>
                  </tr>
                ))}
                {transfers.length === 0 && !loading && <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No transfers</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "aml" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 bg-slate-50 dark:bg-slate-900 border-b">
              <th className="px-4 py-3">Risk</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Corridor</th><th className="px-4 py-3">Rule</th><th className="px-4 py-3">Hours in Queue</th><th className="px-4 py-3">Actions</th>
            </tr></thead>
            <tbody>
              {amlFlags.map(f => (
                <tr key={f.id} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor(f.risk_score)}`}>{f.risk_score}</span></td>
                  <td className="px-4 py-3">{f.user_name || f.userId?.slice(0, 8)}</td>
                  <td className="px-4 py-3 font-medium">{fmt(f.sendAmount)}</td>
                  <td className="px-4 py-3">{f.sendCurrency}→{f.receiveCurrency}</td>
                  <td className="px-4 py-3 text-xs">{f.rule_triggered}</td>
                  <td className="px-4 py-3">{f.hours_in_queue != null ? `${f.hours_in_queue}h` : Math.max(1, Math.round((Date.now() - new Date(f.created_at ?? f.createdAt).getTime()) / 3600000)) + "h"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleAmlAction(f.id, "release")} className="px-2 py-1 bg-emerald-600 text-white rounded text-xs">Release</button>
                    <button onClick={() => handleAmlAction(f.id, "block")} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Block</button>
                    <button onClick={() => handleAmlAction(f.id, "escalate")} className="px-2 py-1 bg-amber-600 text-white rounded text-xs">Escalate</button>
                  </td>
                </tr>
              ))}
              {amlFlags.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No AML flags — all clear</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
