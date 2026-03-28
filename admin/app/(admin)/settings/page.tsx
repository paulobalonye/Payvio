"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type Tab = "admins" | "limits" | "flags" | "audit";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("admins");
  const [admins, setAdmins] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [limits, setLimits] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", role: "SUPPORT" });
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");
  const [auditFilter, setAuditFilter] = useState({ action: "", admin_id: "" });
  const [newLimitKey, setNewLimitKey] = useState("");
  const [newLimitValue, setNewLimitValue] = useState("");

  useEffect(() => {
    api.get("/system/admins").then(r => setAdmins(r.data.data ?? [])).catch(() => {});
    api.get("/system/feature-flags").then(r => setFlags(r.data.data ?? [])).catch(() => {});
    api.get("/system/audit-log").then(r => setAuditLog(r.data.data ?? [])).catch(() => {});
    api.get("/system/limits").then(r => setLimits(r.data.data ?? [])).catch(() => {});
  }, []);

  const handleCreateAdmin = async () => {
    try {
      await api.post("/system/admins", newAdmin);
      setShowCreate(false);
      setNewAdmin({ email: "", password: "", role: "SUPPORT" });
      const { data } = await api.get("/system/admins");
      setAdmins(data.data ?? []);
    } catch (err) { console.error(err); alert("Action failed. Please try again."); }
  };

  const handleToggleFlag = async (key: string, enabled: boolean) => {
    try {
      await api.patch(`/system/feature-flags/${key}`, { enabled: !enabled });
      const { data } = await api.get("/system/feature-flags");
      setFlags(data.data ?? []);
    } catch (err) { console.error(err); alert("Action failed. Please try again."); }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this admin?")) return;
    try {
      await api.patch(`/system/admins/${id}/deactivate`);
      const { data } = await api.get("/system/admins");
      setAdmins(data.data ?? []);
    } catch (err) { console.error(err); alert("Action failed. Please try again."); }
  };

  const handleChangeRole = async (id: string) => {
    try {
      await api.patch(`/system/admins/${id}/role`, { role: newRole });
      setEditingRole(null);
      const { data } = await api.get("/system/admins");
      setAdmins(data.data ?? []);
    } catch (err) { console.error(err); alert("Action failed. Please try again."); }
  };

  const handleUpdateLimit = async (key: string, value: string) => {
    try {
      await api.patch(`/system/limits/${key}`, { value: parseInt(value) });
      const { data } = await api.get("/system/limits");
      setLimits(data.data ?? []);
    } catch (err) { console.error(err); alert("Action failed. Please try again."); }
  };

  const handleAddLimit = async () => {
    if (!newLimitKey || !newLimitValue) return;
    try {
      await api.patch(`/system/limits/${newLimitKey}`, { value: parseInt(newLimitValue) });
      setNewLimitKey(""); setNewLimitValue("");
      const { data } = await api.get("/system/limits");
      setLimits(data.data ?? []);
    } catch (err) { console.error(err); alert("Action failed. Please try again."); }
  };

  const filterAuditLog = async () => {
    const params = new URLSearchParams();
    if (auditFilter.action) params.set("action", auditFilter.action);
    if (auditFilter.admin_id) params.set("admin_id", auditFilter.admin_id);
    const { data } = await api.get(`/system/audit-log/filtered?${params}`);
    setAuditLog(data.data ?? []);
  };

  const exportAuditCSV = () => {
    const header = "Timestamp,Admin,Action,Entity,Details\n";
    const rows = auditLog.map(l => `${new Date(l.createdAt).toISOString()},${l.admin?.email ?? l.adminId},${l.action},${l.entity},${(l.details ?? "").replace(/,/g, ";")}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "audit-log.csv"; a.click();
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "admins", label: "Admin Users" }, { key: "limits", label: "Transfer Limits" },
    { key: "flags", label: "Feature Flags" }, { key: "audit", label: "Audit Log" },
  ];

  const ROLES = ["SUPER_ADMIN", "COMPLIANCE", "SUPPORT", "FINANCE"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">System Settings</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.key ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300 dark:border-slate-600"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "admins" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Admin Users</h2>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium">Create Admin</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b"><th className="pb-3">Email</th><th className="pb-3">Role</th><th className="pb-3">Status</th><th className="pb-3">Last Login</th><th className="pb-3">Actions</th></tr></thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-3">{a.email}</td>
                  <td className="py-3">
                    {editingRole === a.id ? (
                      <div className="flex gap-2">
                        <select value={newRole} onChange={e => setNewRole(e.target.value)} className="border rounded px-2 py-1 text-xs">
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={() => handleChangeRole(a.id)} className="text-emerald-600 text-xs font-medium">Save</button>
                        <button onClick={() => setEditingRole(null)} className="text-slate-400 text-xs">Cancel</button>
                      </div>
                    ) : (
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium cursor-pointer" onClick={() => { setEditingRole(a.id); setNewRole(a.role); }}>{a.role}</span>
                    )}
                  </td>
                  <td className="py-3">{a.isActive ? <span className="text-emerald-600">Active</span> : <span className="text-red-600">Inactive</span>}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : "Never"}</td>
                  <td className="py-3">{a.isActive && <button onClick={() => handleDeactivate(a.id)} className="text-red-600 text-xs font-medium">Deactivate</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "limits" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Transfer Limits</h2>
          <table className="w-full text-sm mb-4">
            <thead><tr className="text-left text-slate-500 border-b"><th className="pb-3">Key</th><th className="pb-3">Value (cents)</th><th className="pb-3">Description</th><th className="pb-3">Actions</th></tr></thead>
            <tbody>
              {limits.map(l => (
                <tr key={l.id} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-3 font-mono text-xs">{l.key}</td>
                  <td className="py-3"><input defaultValue={l.value} className="border rounded px-2 py-1 w-24 text-sm" onBlur={(e) => handleUpdateLimit(l.key, e.target.value)} /></td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{l.description}</td>
                  <td className="py-3 text-xs text-slate-400">{l.updatedBy ? `by ${l.updatedBy.slice(0,8)}` : ""}</td>
                </tr>
              ))}
              {limits.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-slate-400">No limits configured</td></tr>}
            </tbody>
          </table>
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <input value={newLimitKey} onChange={e => setNewLimitKey(e.target.value)} placeholder="Key (e.g. daily_send_limit)" className="border rounded-lg px-3 py-2 text-sm flex-1" />
            <input value={newLimitValue} onChange={e => setNewLimitValue(e.target.value)} placeholder="Value (cents)" className="border rounded-lg px-3 py-2 text-sm w-32" type="number" />
            <button onClick={handleAddLimit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Add</button>
          </div>
        </div>
      )}

      {tab === "flags" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Feature Flags</h2>
          {flags.length > 0 ? flags.map(f => (
            <div key={f.id} className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700">
              <div><span className="font-medium">{f.label || f.key}</span><span className="text-xs text-slate-400 ml-2">{f.key}</span></div>
              <button onClick={() => handleToggleFlag(f.key, f.enabled)}
                className={`w-12 h-6 rounded-full transition relative ${f.enabled ? "bg-indigo-600" : "bg-slate-300"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-800 rounded-full transition-all ${f.enabled ? "left-7" : "left-1"}`} />
              </button>
            </div>
          )) : <p className="text-slate-400 text-sm">No feature flags configured</p>}
        </div>
      )}

      {tab === "audit" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Audit Log</h2>
            <button onClick={exportAuditCSV} className="text-xs text-indigo-600 font-medium hover:underline">Export CSV</button>
          </div>
          <div className="flex gap-3 mb-4">
            <input value={auditFilter.action} onChange={e => setAuditFilter({...auditFilter, action: e.target.value})} placeholder="Filter by action..." className="border rounded-lg px-3 py-2 text-sm flex-1" />
            <button onClick={filterAuditLog} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Filter</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b"><th className="pb-3">Time</th><th className="pb-3">Admin</th><th className="pb-3">Action</th><th className="pb-3">Entity</th><th className="pb-3">Details</th></tr></thead>
            <tbody>
              {auditLog.map(l => (
                <tr key={l.id} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-3 text-slate-500 text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="py-3">{l.admin?.email ?? l.adminId?.slice(0,8)}</td>
                  <td className="py-3 font-medium text-xs">{l.action}</td>
                  <td className="py-3 text-xs">{l.entity}</td>
                  <td className="py-3 text-xs text-slate-500 max-w-xs truncate">{l.details ?? "—"}</td>
                </tr>
              ))}
              {auditLog.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-400">No audit entries</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Admin</h3>
            <input placeholder="Email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3" />
            <input type="password" placeholder="Temporary Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3" />
            <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})} className="w-full border rounded-lg p-3 text-sm mb-3">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
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
