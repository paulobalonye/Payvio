"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function UserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [noteText, setNoteText] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspend, setShowSuspend] = useState(false);

  useEffect(() => { fetchUser(); }, [id]);

  const fetchUser = async () => {
    try {
      const { data: res } = await api.get(`/users/${id}`);
      setData(res.data);
    } catch {}
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await api.post(`/users/${id}/notes`, { content: noteText });
    setNoteText("");
    fetchUser();
  };

  const handleSuspend = async (action: "suspend" | "unsuspend") => {
    if (suspendReason.length < 20) { alert("Reason must be at least 20 characters"); return; }
    await api.patch(`/users/${id}/status`, { action, reason: suspendReason });
    setSuspendReason("");
    setShowSuspend(false);
    fetchUser();
  };

  if (!data) return <div className="p-8 text-slate-400">Loading...</div>;

  const { user, notes } = data;
  const fmt = (cents: number) => "$" + (cents / 100).toFixed(2);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">User Detail</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="space-y-3 text-sm">
            <Row label="ID" value={user.id} />
            <Row label="Name" value={`${user.firstName ?? "—"} ${user.lastName ?? ""}`} />
            <Row label="Email" value={user.email ?? "—"} />
            <Row label="Phone" value={`${user.countryCode}${user.phone}`} />
            <Row label="KYC Status" value={user.kycStatus} badge />
            <Row label="Referral Code" value={user.referralCode} />
            <Row label="Joined" value={new Date(user.createdAt).toLocaleString()} />
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => setShowSuspend(true)}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100">
              {user.kycStatus === "REJECTED" ? "Unsuspend" : "Suspend"}
            </button>
          </div>
        </div>

        {/* Wallets */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Wallets</h2>
          {user.wallets?.length > 0 ? user.wallets.map((w: any) => (
            <div key={w.id} className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-medium">{w.currency}</span>
              <span>{fmt(w.balance)}</span>
            </div>
          )) : <p className="text-slate-400 text-sm">No wallets</p>}
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {user.kycStatus === "REJECTED" ? "Unsuspend User" : "Suspend User"}
            </h3>
            <textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Reason (min 20 characters)..." rows={3}
              className="w-full border border-slate-300 rounded-lg p-3 text-sm mb-4 outline-none" />
            <div className="flex gap-3">
              <button onClick={() => handleSuspend(user.kycStatus === "REJECTED" ? "unsuspend" : "suspend")}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium">Confirm</button>
              <button onClick={() => setShowSuspend(false)}
                className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-2 text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transfers */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 mb-6">
        <h2 className="text-lg font-semibold mb-4">Recent Transfers</h2>
        {user.transfersSent?.length > 0 ? (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b">
              <th className="pb-2">Amount</th><th className="pb-2">To</th><th className="pb-2">Status</th><th className="pb-2">Date</th>
            </tr></thead>
            <tbody>
              {user.transfersSent.map((t: any) => (
                <tr key={t.id} className="border-b border-slate-50">
                  <td className="py-2">{fmt(t.sendAmount)} {t.sendCurrency}</td>
                  <td className="py-2">{t.receiveCurrency}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${t.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{t.status}</span></td>
                  <td className="py-2 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-slate-400 text-sm">No transfers</p>}
      </div>

      {/* Admin Notes */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h2 className="text-lg font-semibold mb-4">Admin Notes</h2>
        <div className="flex gap-3 mb-4">
          <input value={noteText} onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..." className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none" />
          <button onClick={handleAddNote} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Add</button>
        </div>
        {notes?.map((n: any) => (
          <div key={n.id} className="py-3 border-b border-slate-100">
            <p className="text-sm">{n.content}</p>
            <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      {badge ? (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          value === "APPROVED" ? "bg-emerald-50 text-emerald-700" :
          value === "PENDING" ? "bg-amber-50 text-amber-700" :
          value === "REJECTED" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
        }`}>{value}</span>
      ) : <span className="font-medium text-slate-900">{value}</span>}
    </div>
  );
}
