"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function SupportPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [notifUserId, setNotifUserId] = useState("");
  const [notifChannel, setNotifChannel] = useState("email");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifStatus, setNotifStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleLookup = async () => {
    if (!query.trim()) return;
    try {
      const { data } = await api.get(`/lookup?q=${encodeURIComponent(query)}`);
      setResults(data.data);
    } catch {}
  };

  const handleSendNotif = async () => {
    if (!notifUserId || !notifMessage) return;
    setNotifStatus("sending");
    try {
      await api.post("/notifications/send", {
        user_id: notifUserId,
        channel: notifChannel,
        message: notifMessage,
      });
      setNotifStatus("sent");
      setNotifMessage("");
      setTimeout(() => setNotifStatus("idle"), 3000);
    } catch {
      setNotifStatus("error");
      setTimeout(() => setNotifStatus("idle"), 3000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Support Tools</h1>

      {/* Universal Lookup */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Universal Lookup</h2>
        <div className="flex gap-3 mb-4">
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="Search by user ID, email, phone, transfer ID, or referral code..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none" />
          <button onClick={handleLookup} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Search</button>
        </div>

        {results && (
          <div className="space-y-4">
            {results.users?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Users ({results.users.length})</h3>
                {results.users.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <span className="font-medium">{u.firstName} {u.lastName}</span>
                      <span className="text-slate-400 text-sm ml-2">{u.email}</span>
                      <span className="text-slate-400 text-xs ml-2">({u.kycStatus})</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setNotifUserId(u.id)} className="text-indigo-600 text-xs font-medium">Send Notif</button>
                      <a href={`/users/${u.id}`} className="text-indigo-600 text-xs font-medium">View</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {results.transfers?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Transfers ({results.transfers.length})</h3>
                {results.transfers.map((t: any) => (
                  <div key={t.id} className="py-2 border-b border-slate-100 text-sm">
                    <span className="font-mono">{t.id.slice(0,12)}</span>
                    <span className="ml-4">${(t.sendAmount / 100).toFixed(2)}</span>
                    <span className={`ml-4 px-2 py-0.5 rounded-full text-xs ${t.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{t.status}</span>
                  </div>
                ))}
              </div>
            )}
            {results.users?.length === 0 && results.transfers?.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">No results found</p>
            )}
          </div>
        )}
      </div>

      {/* Notification Composer */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Send Notification</h2>
        <input value={notifUserId} onChange={(e) => setNotifUserId(e.target.value)} placeholder="User ID"
          className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm mb-3 outline-none" />
        <select value={notifChannel} onChange={(e) => setNotifChannel(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm mb-3">
          <option value="email">Email</option>
          <option value="push">Push Notification</option>
          <option value="both">Email + Push</option>
        </select>
        <textarea value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} placeholder="Message..."
          rows={3} className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm mb-3 outline-none" />
        <button onClick={handleSendNotif} disabled={notifStatus === "sending"}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
            notifStatus === "sent" ? "bg-emerald-600 text-white" :
            notifStatus === "error" ? "bg-red-600 text-white" :
            "bg-indigo-600 text-white hover:bg-indigo-500"
          } disabled:opacity-50`}>
          {notifStatus === "sending" ? "Sending..." : notifStatus === "sent" ? "Sent!" : notifStatus === "error" ? "Failed" : "Send Notification"}
        </button>
      </div>
    </div>
  );
}
