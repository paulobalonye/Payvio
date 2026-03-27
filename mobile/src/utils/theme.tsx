import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

const lightColors = {
  bg: "#fafbff",
  bgSecondary: "#f1f5f9",
  card: "#ffffff",
  cardBorder: "#e2e8f0",
  text: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  accent: "#4f46e5",
  accentLight: "rgba(99,102,241,0.06)",
  accentHover: "#6366f1",
  success: "#059669",
  successBg: "#ecfdf5",
  error: "#ef4444",
  errorBg: "#fef2f2",
  warning: "#d97706",
  warningBg: "#fffbeb",
  white: "#ffffff",
  tabBar: "#ffffff",
  tabBarBorder: "#e2e8f0",
  inputBg: "#ffffff",
  inputBorder: "#e2e8f0",
  balanceCardBg: "linear-gradient(135deg, #4f46e5, #6366f1)",
  balanceCard: "#4f46e5",
  balanceCardDark: "#4338ca",
  statusBarStyle: "dark" as const,
} as const;

const darkColors = {
  bg: "#0f172a",
  bgSecondary: "#1e293b",
  card: "#1e293b",
  cardBorder: "#334155",
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  accent: "#6366f1",
  accentLight: "rgba(99,102,241,0.15)",
  accentHover: "#818cf8",
  success: "#34d399",
  successBg: "#064e3b",
  error: "#f87171",
  errorBg: "#7f1d1d",
  warning: "#fbbf24",
  warningBg: "#78350f",
  white: "#ffffff",
  tabBar: "#0f172a",
  tabBarBorder: "#1e293b",
  inputBg: "#1e293b",
  inputBorder: "#334155",
  balanceCardBg: "linear-gradient(135deg, #312e81, #4338ca)",
  balanceCard: "#312e81",
  balanceCardDark: "#1e1b4b",
  statusBarStyle: "light" as const,
} as const;

export type Colors = {
  readonly [K in keyof typeof lightColors]: string;
};

type ThemeContextType = {
  readonly theme: Theme;
  readonly colors: Colors;
  readonly toggleTheme: () => void;
  readonly isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  colors: lightColors,
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemScheme === "dark" ? "dark" : "light");

  useEffect(() => {
    SecureStore.getItemAsync("app_theme").then((saved) => {
      if (saved === "light" || saved === "dark") setTheme(saved);
    });
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    SecureStore.setItemAsync("app_theme", next);
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
