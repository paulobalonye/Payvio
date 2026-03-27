"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

const FILTERS = ["all", "pending_kyc", "suspended"] as const;
const FILTER_LABELS: Record<string, string> = { all: "All", pending_kyc: "Pending KYC", suspended: "Suspended" };

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, [filter]);

  const fetchUsers = async (q?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q ?? search) params.set("search", q ?? search);
      if (filter !== "all") params.set("status", filter);
      const { data } = await api.get(`/users?${params}`);
      setUsers(data.data ?? []);
    } catch {} finally { setLoading(false); }
  };

  let debounceTimer: any;
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchUsers(val), 300);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">User Management</h1>

      <div className="flex gap-4 mb-6">
        <input value={search} onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, email, phone, or ID..."
          className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm outline-none focus:border-indigo-500" />
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition ${filter === f ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 bg-slate-50 dark:bg-slate-900 border-b">
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">KYC</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 font-medium">{u.first_name ?? "—"} {u.last_name ?? ""}</td>
                <td className="px-6 py-4 text-slate-600">{u.email ?? "—"}</td>
                <td className="px-6 py-4 text-slate-600">{u.phone}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.kyc_status === "approved" ? "bg-emerald-50 text-emerald-700" :
                    u.kyc_status === "pending" ? "bg-amber-50 text-amber-700" :
                    u.kyc_status === "rejected" ? "bg-red-50 text-red-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>{u.kyc_status}</span>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <Link href={`/users/${u.id}`} className="text-indigo-600 text-xs font-medium hover:underline">View</Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
