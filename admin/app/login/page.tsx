"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", {
        email, password, totp_code: step === "mfa" ? totpCode : undefined,
      });
      if (data.data.requires_mfa) {
        setStep("mfa");
      } else {
        localStorage.setItem("admin_token", data.data.token);
        localStorage.setItem("admin_role", data.data.admin.role);
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-400">Payvio</h1>
          <p className="text-slate-400 text-sm mt-1">Admin Dashboard</p>
        </div>

        <form
          className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700"
          onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            {step === "credentials" ? "Sign In" : "Enter MFA Code"}
          </h2>

          {step === "credentials" ? (
            <>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" autoFocus
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 mb-4 border border-slate-600 focus:border-indigo-500 outline-none"
              />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 mb-4 border border-slate-600 focus:border-indigo-500 outline-none"
              />
            </>
          ) : (
            <input
              type="text" value={totpCode} onChange={(e) => setTotpCode(e.target.value)}
              placeholder="6-digit code" maxLength={6} autoFocus
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 mb-4 border border-slate-600 focus:border-indigo-500 outline-none text-center text-2xl tracking-widest"
            />
          )}

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-lg py-3 font-medium hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {loading ? "..." : step === "credentials" ? "Sign In" : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
