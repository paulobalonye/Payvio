import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Wallet Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balanceAmount}>$0.00</Text>
        <Text style={styles.balanceCurrency}>USD</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>+</Text>
          <Text style={styles.actionText}>Add Money</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionPrimary]}>
          <Text style={[styles.actionIcon, { color: "#fff" }]}>→</Text>
          <Text style={[styles.actionText, { color: "#fff" }]}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>←</Text>
          <Text style={styles.actionText}>Request</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>Send your first transfer to get started</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafbff", padding: 24 },
  balanceCard: { backgroundColor: "#4f46e5", borderRadius: 20, padding: 28, alignItems: "center", marginBottom: 24 },
  balanceLabel: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 8 },
  balanceAmount: { color: "#fff", fontSize: 40, fontWeight: "700" },
  balanceCurrency: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 4 },
  actions: { flexDirection: "row", gap: 12, marginBottom: 32 },
  actionButton: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  actionPrimary: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  actionIcon: { fontSize: 20, fontWeight: "700", color: "#4f46e5", marginBottom: 4 },
  actionText: { fontSize: 12, fontWeight: "600", color: "#0f172a" },
  section: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 16 },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#64748b", marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: "#94a3b8" },
});
