"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type Tab = "admins" | "limits" | "flags" | "audit";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("admins");
  const [admins, setAdmins] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", role: "SUPPORT" });

  useEffect(() => {
    api.get("/system/admins").then(r => setAdmins(r.data.data ?? [])).catch(() => {});
    api.get("/system/feature-flags").then(r => setFlags(r.data.data ?? [])).catch(() => {});
    api.get("/system/audit-log").then(r => setAuditLog(r.data.data ?? [])).catch(() => {});
  }, []);

  const handleCreateAdmin = async () => {
    await api.post("/system/admins", newAdmin);
    setShowCreate(false);
    const { data } = await api.get("/system/admins");
    setAdmins(data.data ?? []);
  };

  const handleToggleFlag = async (key: string, enabled: boolean) => {
    await api.patch(`/system/feature-flags/${key}`, { enabled: !enabled });
    const { data } = await api.get("/system/feature-flags");
    setFlags(data.data ?? []);
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this admin?")) return;
    await api.patch(`/system/admins/${id}/deactivate`);
    const { data } = await api.get("/system/admins");
    setAdmins(data.data ?? []);
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "admins", label: "Admin Users" }, { key: "limits", label: "Transfer Limits" },
    { key: "flags", label: "Feature Flags" }, { key: "audit", label: "Audit Log" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">System Settings</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.key ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "admins" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Admin Users</h2>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium">Create Admin</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b"><th className="pb-3">Email</th><th className="pb-3">Role</th><th className="pb-3">Status</th><th className="pb-3">Last Login</th><th className="pb-3">Actions</th></tr></thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="py-3">{a.email}</td>
                  <td className="py-3"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{a.role}</span></td>
                  <td className="py-3">{a.isActive ? <span className="text-emerald-600">Active</span> : <span className="text-red-600">Inactive</span>}</td>
                  <td className="py-3 text-slate-500">{a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : "Never"}</td>
                  <td className="py-3">{a.isActive && <button onClick={() => handleDeactivate(a.id)} className="text-red-600 text-xs font-medium">Deactivate</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "flags" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Feature Flags</h2>
          {flags.length > 0 ? flags.map(f => (
            <div key={f.id} className="flex justify-between items-center py-3 border-b border-slate-100">
              <div><span className="font-medium">{f.label || f.key}</span><span className="text-xs text-slate-400 ml-2">{f.key}</span></div>
              <button onClick={() => handleToggleFlag(f.key, f.enabled)}
                className={`w-12 h-6 rounded-full transition ${f.enabled ? "bg-indigo-600" : "bg-slate-300"} relative`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${f.enabled ? "left-7" : "left-1"}`} />
              </button>
            </div>
          )) : <p className="text-slate-400 text-sm">No feature flags configured</p>}
        </div>
      )}

      {tab === "audit" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Audit Log</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b"><th className="pb-3">Time</th><th className="pb-3">Admin</th><th className="pb-3">Action</th><th className="pb-3">Entity</th><th className="pb-3">Details</th></tr></thead>
            <tbody>
              {auditLog.map(l => (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="py-3 text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="py-3">{l.admin?.email ?? l.adminId.slice(0,8)}</td>
                  <td className="py-3 font-medium">{l.action}</td>
                  <td className="py-3">{l.entity}</td>
                  <td className="py-3 text-xs text-slate-500 max-w-xs truncate">{l.details ?? "—"}</td>
                </tr>
              ))}
              {auditLog.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-400">No audit entries</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "limits" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Transfer Limits</h2>
          <p className="text-slate-400 text-sm">Configure global transfer limits here. Coming soon.</p>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Admin</h3>
            <input placeholder="Email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3" />
            <input type="password" placeholder="Temporary Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3" />
            <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3">
              <option value="SUPPORT">Support</option><option value="COMPLIANCE">Compliance</option><option value="FINANCE">Finance</option><option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <div className="flex gap-3">
              <button onClick={handleCreateAdmin} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium">Create</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-2 text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
