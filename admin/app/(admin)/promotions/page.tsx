"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function PromotionsPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", type: "zero_fee", startDate: "", endDate: "", discount: 0 });

  useEffect(() => { api.get("/promotions").then(r => setPromos(r.data.data ?? [])).catch(() => {}); }, []);

  const handleCreate = async () => {
    await api.post("/promotions", { ...form, start_date: new Date(form.startDate), end_date: new Date(form.endDate) });
    setShowCreate(false);
    const { data } = await api.get("/promotions");
    setPromos(data.data ?? []);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Promotions</h1>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Create Promotion</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map(p => (
          <div key={p.id} className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold">{p.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{p.isActive ? "Active" : "Inactive"}</span>
            </div>
            <p className="text-sm text-slate-500 mb-2">Type: {p.type}</p>
            <p className="text-sm text-slate-500">Usage: {p.usageCount}{p.usageCap ? `/${p.usageCap}` : ""}</p>
          </div>
        ))}
        {promos.length === 0 && <p className="text-slate-400 col-span-3 text-center py-12">No promotions yet</p>}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Promotion</h3>
            <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3">
              <option value="zero_fee">Zero Fee</option><option value="flat_discount">Flat Discount</option><option value="referral_bonus">Referral Bonus</option>
            </select>
            <input type="date" placeholder="Start" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3" />
            <input type="date" placeholder="End" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3" />
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
