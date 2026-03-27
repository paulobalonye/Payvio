export type AdminRole = "SUPER_ADMIN" | "COMPLIANCE" | "SUPPORT" | "FINANCE";

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  COMPLIANCE: "Compliance",
  SUPPORT: "Support",
  FINANCE: "Finance",
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", roles: ["SUPER_ADMIN", "COMPLIANCE", "SUPPORT", "FINANCE"] },
  { href: "/users", label: "Users", roles: ["SUPER_ADMIN", "COMPLIANCE", "SUPPORT"] },
  { href: "/kyc", label: "KYC Review", roles: ["SUPER_ADMIN", "COMPLIANCE"] },
  { href: "/transactions", label: "Transactions", roles: ["SUPER_ADMIN", "COMPLIANCE", "SUPPORT"] },
  { href: "/fx-rates", label: "FX Rates", roles: ["SUPER_ADMIN", "FINANCE"] },
  { href: "/promotions", label: "Promotions", roles: ["SUPER_ADMIN", "FINANCE"] },
  { href: "/support", label: "Support", roles: ["SUPER_ADMIN", "SUPPORT"] },
  { href: "/settings", label: "Settings", roles: ["SUPER_ADMIN"] },
] as const;
