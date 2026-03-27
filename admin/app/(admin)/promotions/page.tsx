"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function PromotionsPage() {
  const [tab, setTab] = useState<"promos" | "referrals">("promos");
  const [promos, setPromos] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", type: "zero_fee", startDate: "", endDate: "", discount: 0, eligibility: "all", usageCap: "" });

  useEffect(() => {
    api.get("/promotions").then(r => setPromos(r.data.data ?? [])).catch(() => {});
    api.get("/referrals/stats").then(r => setReferralStats(r.data.data)).catch(() => {});
  }, []);

  const handleCreate = async () => {
    await api.post("/promotions", {
      name: form.name, type: form.type, eligibility: form.eligibility,
      startDate: new Date(form.startDate), endDate: new Date(form.endDate),
      discount: form.discount, usageCap: form.usageCap ? parseInt(form.usageCap) : null,
    });
    setShowCreate(false);
    const { data } = await api.get("/promotions");
    setPromos(data.data ?? []);
  };

  const handleDeactivate = async (id: string) => {
    await api.delete(`/promotions/${id}`);
    const { data } = await api.get("/promotions");
    setPromos(data.data ?? []);
  };

  const exportReferralCSV = () => {
    if (!referralStats?.top_referrers) return;
    const header = "Name,Referrals,Converted,Earned\n";
    const rows = referralStats.top_referrers.map((r: any) => `${r.name},${r.count},${r.converted},${(r.earned / 100).toFixed(2)}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "referral-data.csv"; a.click();
  };

  const fmt = (cents: number) => "$" + (cents / 100).toFixed(2);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Promotions & Referrals</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab("promos")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "promos" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300"}`}>Promotions</button>
          <button onClick={() => setTab("referrals")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "referrals" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300"}`}>Referrals</button>
        </div>
      </div>

      {tab === "promos" && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Create Promotion</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map(p => (
              <div key={p.id} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{p.isActive ? "Active" : "Inactive"}</span>
                </div>
                <p className="text-sm text-slate-500 mb-1">Type: {p.type}</p>
                <p className="text-sm text-slate-500 mb-1">Eligibility: {p.eligibility}</p>
                <p className="text-sm text-slate-500 mb-3">Usage: {p.usageCount}{p.usageCap ? `/${p.usageCap}` : ""}</p>
                {p.isActive && (
                  <button onClick={() => handleDeactivate(p.id)} className="text-red-600 text-xs font-medium">Deactivate</button>
                )}
              </div>
            ))}
            {promos.length === 0 && <p className="text-slate-400 col-span-3 text-center py-12">No promotions yet</p>}
          </div>
        </>
      )}

      {tab === "referrals" && referralStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
              <p className="text-sm text-slate-500 mb-1">Total Referrals</p>
              <p className="text-3xl font-bold text-slate-900">{referralStats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
              <p className="text-sm text-slate-500 mb-1">Converted</p>
              <p className="text-3xl font-bold text-emerald-600">{referralStats.converted}</p>
              <p className="text-xs text-slate-400 mt-1">{referralStats.total > 0 ? `${((referralStats.converted / referralStats.total) * 100).toFixed(1)}%` : "0%"} conversion</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
              <p className="text-sm text-slate-500 mb-1">Total Rewards Paid</p>
              <p className="text-3xl font-bold text-indigo-600">{fmt(referralStats.total_paid)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Top Referrers</h2>
              <button onClick={exportReferralCSV} className="text-xs text-indigo-600 font-medium hover:underline">Export CSV</button>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 border-b"><th className="pb-3">Name</th><th className="pb-3">Referrals</th><th className="pb-3">Converted</th><th className="pb-3">Earned</th></tr></thead>
              <tbody>
                {referralStats.top_referrers?.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 font-medium">{r.name}</td>
                    <td className="py-3">{r.count}</td>
                    <td className="py-3">{r.converted}</td>
                    <td className="py-3 text-emerald-600 font-medium">{fmt(r.earned)}</td>
                  </tr>
                ))}
                {(!referralStats.top_referrers || referralStats.top_referrers.length === 0) && <tr><td colSpan={4} className="py-8 text-center text-slate-400">No referrals yet</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Promotion</h3>
            <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3">
              <option value="zero_fee">Zero Fee</option><option value="flat_discount">Flat Discount</option><option value="referral_bonus">Referral Bonus</option>
            </select>
            <select value={form.eligibility} onChange={e => setForm({...form, eligibility: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3">
              <option value="all">All Users</option><option value="new_users">New Users Only</option><option value="corridor_specific">Corridor Specific</option>
            </select>
            <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3" placeholder="Start Date" />
            <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3" placeholder="End Date" />
            <input type="number" placeholder="Usage cap (optional)" value={form.usageCap} onChange={e => setForm({...form, usageCap: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3" />
            <div className="flex gap-3">
              <button onClick={handleCreate} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium">Create</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-2 text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
