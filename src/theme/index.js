import { Platform } from "react-native";

/** 办公管理 App 设计令牌 */
export const colors = {
  primary: "#1E40AF",
  primaryDark: "#1E3A8A",
  primaryLight: "#3B82F6",
  accent: "#0EA5E9",
  background: "#F0F4F8",
  surface: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  borderFocus: "#3B82F6",
  success: "#059669",
  successBg: "#D1FAE5",
  warning: "#D97706",
  warningBg: "#FEF3C7",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  overlay: "rgba(15, 23, 42, 0.45)",
  header: "#1E3A8A",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const typography = {
  hero: { fontSize: 28, fontWeight: "700", color: colors.text, letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  caption: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 },
};

export const shadow = Platform.select({
  ios: {
    card: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    soft: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
  },
  android: { card: { elevation: 4 }, soft: { elevation: 2 } },
  default: {
    card: { boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)" },
    soft: { boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)" },
  },
});

export const headerOptions = {
  headerStyle: { backgroundColor: colors.header },
  headerTintColor: "#FFFFFF",
  headerTitleStyle: { fontWeight: "600", fontSize: 17 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};
