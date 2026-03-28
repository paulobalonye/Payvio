"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function KycQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("blurry_document");
  const [showReject, setShowReject] = useState(false);

  useEffect(() => { fetchQueue(); }, []);

  const fetchQueue = async () => {
    try {
      const { data } = await api.get("/kyc/queue");
      setQueue(data.data ?? []);
    } catch (err) { console.error(err); }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/kyc/${id}/approve`);
      fetchQueue();
    } catch (err) { console.error(err); alert("Action failed. Please try again."); }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    try {
      await api.post(`/kyc/${selectedId}/reject`, { reason_code: rejectReason });
      setShowReject(false);
      setSelectedId(null);
      fetchQueue();
    } catch (err) { console.error(err); alert("Action failed. Please try again."); }
  };

  const getSlaColor = (hours: number) => hours > 20 ? "bg-red-100 text-red-700" : hours > 12 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">KYC Review Queue</h1>
        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">{queue.length} pending</span>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 bg-slate-50 dark:bg-slate-900 border-b">
            <th className="px-6 py-3">User</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">SLA</th><th className="px-6 py-3">Submitted</th><th className="px-6 py-3">Actions</th>
          </tr></thead>
          <tbody>
            {queue.map(item => (
              <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 font-medium">{item.first_name} {item.last_name}</td>
                <td className="px-6 py-4 text-slate-600">{item.email ?? "—"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSlaColor(item.hours_in_queue)}`}>{item.hours_in_queue}h</span>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(item.submitted_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => handleApprove(item.id)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium">Approve</button>
                  <button onClick={() => { setSelectedId(item.id); setShowReject(true); }} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium">Reject</button>
                </td>
              </tr>
            ))}
            {queue.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Queue is empty</td></tr>}
          </tbody>
        </table>
      </div>

      {showReject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject KYC</h3>
            <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm mb-4">
              <option value="blurry_document">Blurry Document</option>
              <option value="expired_id">Expired ID</option>
              <option value="name_mismatch">Name Mismatch</option>
              <option value="suspected_fraud">Suspected Fraud</option>
              <option value="other">Other</option>
            </select>
            <div className="flex gap-3">
              <button onClick={handleReject} className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium">Reject</button>
              <button onClick={() => setShowReject(false)} className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-2 text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
