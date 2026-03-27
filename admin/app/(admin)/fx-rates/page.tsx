"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function FxRatesPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [spread, setSpread] = useState("");
  const [flatFee, setFlatFee] = useState("");
  const [showOverride, setShowOverride] = useState<string | null>(null);
  const [overrideRate, setOverrideRate] = useState("");
  const [overrideExpiry, setOverrideExpiry] = useState("");

  useEffect(() => { fetchConfigs(); }, []);

  const fetchConfigs = async () => {
    try { const { data } = await api.get("/fx/rates"); setConfigs(data.data ?? []); } catch {}
  };

  const handleSave = async (corridor: string) => {
    await api.patch(`/fx/rates/${corridor}`, { spread: parseFloat(spread), flat_fee: parseInt(flatFee) });
    setEditing(null);
    fetchConfigs();
  };

  const handleSetOverride = async (corridor: string) => {
    await api.post(`/fx/rates/${corridor}/override`, { rate: parseFloat(overrideRate), expiry: overrideExpiry });
    setShowOverride(null);
    setOverrideRate(""); setOverrideExpiry("");
    fetchConfigs();
  };

  const handleRemoveOverride = async (corridor: string) => {
    await api.delete(`/fx/rates/${corridor}/override`);
    fetchConfigs();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">FX Rate Configuration</h1>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 bg-slate-50 border-b">
            <th className="px-6 py-3">Corridor</th><th className="px-6 py-3">Spread %</th><th className="px-6 py-3">Flat Fee</th><th className="px-6 py-3">Override</th><th className="px-6 py-3">Actions</th>
          </tr></thead>
          <tbody>
            {configs.map(c => (
              <tr key={c.id} className="border-b border-slate-100">
                <td className="px-6 py-4 font-medium">{c.corridor}</td>
                <td className="px-6 py-4">
                  {editing === c.corridor ? <input value={spread} onChange={e => setSpread(e.target.value)} className="w-20 border rounded px-2 py-1 text-sm" /> : `${c.spread}%`}
                </td>
                <td className="px-6 py-4">
                  {editing === c.corridor ? <input value={flatFee} onChange={e => setFlatFee(e.target.value)} className="w-20 border rounded px-2 py-1 text-sm" /> : `$${(c.flatFee / 100).toFixed(2)}`}
                </td>
                <td className="px-6 py-4">
                  {c.overrideRate ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {c.overrideRate} — expires {new Date(c.overrideExpiry).toLocaleDateString()}
                      </span>
                      <button onClick={() => handleRemoveOverride(c.corridor)} className="text-red-500 text-xs">Remove</button>
                    </div>
                  ) : "—"}
                </td>
                <td className="px-6 py-4">
                  {editing === c.corridor ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleSave(c.corridor)} className="text-emerald-600 text-xs font-medium">Save</button>
                      <button onClick={() => setEditing(null)} className="text-slate-400 text-xs">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(c.corridor); setSpread(c.spread.toString()); setFlatFee(c.flatFee.toString()); }} className="text-indigo-600 text-xs font-medium">Edit</button>
                      <button onClick={() => setShowOverride(c.corridor)} className="text-orange-600 text-xs font-medium">Override</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {configs.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No rate configs. They appear when corridors are configured.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Override Modal */}
      {showOverride && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Temporary Rate Override — {showOverride}</h3>
            <input type="number" step="0.01" placeholder="Override rate" value={overrideRate} onChange={e => setOverrideRate(e.target.value)} className="w-full border rounded-lg p-3 text-sm mb-3" />
            <input type="datetime-local" placeholder="Expiry" value={overrideExpiry} onChange={e => setOverrideExpiry(e.target.value)} className="w-full border rounded-lg p-3 text-sm mb-3" />
            <div className="flex gap-3">
              <button onClick={() => handleSetOverride(showOverride)} className="flex-1 bg-orange-600 text-white rounded-lg py-2 text-sm font-medium">Set Override</button>
              <button onClick={() => setShowOverride(null)} className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-2 text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
