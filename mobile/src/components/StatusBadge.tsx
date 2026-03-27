import { View, Text, StyleSheet } from "react-native";
import { colors } from "../utils/colors";

type Status = "delivered" | "processing" | "initiated" | "failed" | "refunded" | "pending" | "paid" | "approved" | "rejected";

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
  delivered: { bg: colors.successBg, text: colors.success, label: "Delivered" },
  processing: { bg: colors.warningBg, text: colors.warning, label: "Processing" },
  initiated: { bg: colors.accentLight, text: colors.accent, label: "Initiated" },
  failed: { bg: colors.errorBg, text: colors.error, label: "Failed" },
  refunded: { bg: colors.errorBg, text: colors.error, label: "Refunded" },
  pending: { bg: colors.warningBg, text: colors.warning, label: "Pending" },
  paid: { bg: colors.successBg, text: colors.success, label: "Paid" },
  approved: { bg: colors.successBg, text: colors.success, label: "Approved" },
  rejected: { bg: colors.errorBg, text: colors.error, label: "Rejected" },
};

export default function StatusBadge({ status }: { readonly status: Status }) {
  const config = statusConfig[status] ?? statusConfig.pending;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  text: { fontSize: 12, fontWeight: "600" },
});
