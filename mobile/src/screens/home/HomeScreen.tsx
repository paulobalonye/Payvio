import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, RefreshControl, StyleSheet, SafeAreaView } from "react-native";
import { walletApi } from "../../api";
import { api } from "../../api";
import { formatCurrency, formatDate } from "../../utils/format";
import StatusBadge from "../../components/StatusBadge";
import { colors } from "../../utils/colors";

export default function HomeScreen({ navigation }: any) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        walletApi.getWallet("USD"),
        api.get("/transactions?limit=5"),
      ]);
      setBalance(walletRes.data.data.balance);
      setTransactions(txRes.data.data ?? []);
    } catch {
      // silently fail — show cached data
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            {/* Header */}
            <Text style={styles.greeting}>Payvio</Text>

            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Your Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
              <Text style={styles.balanceCurrency}>USD</Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("AddMoney")}>
                <Text style={styles.actionIcon}>+</Text>
                <Text style={styles.actionText}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.actionPrimary]} onPress={() => navigation.navigate("Send")}>
                <Text style={[styles.actionIcon, { color: colors.white }]}>↑</Text>
                <Text style={[styles.actionText, { color: colors.white }]}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("PaymentRequest")}>
                <Text style={styles.actionIcon}>↓</Text>
                <Text style={styles.actionText}>Request</Text>
              </TouchableOpacity>
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent</Text>
              <TouchableOpacity onPress={() => navigation.navigate("History")}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.txRow}
            onPress={() => navigation.navigate("TransactionDetail", { transaction: item })}
          >
            <View style={styles.txLeft}>
              <Text style={styles.txDesc}>{item.description}</Text>
              <Text style={styles.txDate}>{formatDate(item.created_at)}</Text>
            </View>
            <View style={styles.txRight}>
              <Text style={[styles.txAmount, item.type === "wallet_credit" && { color: colors.success }]}>
                {item.type === "wallet_credit" ? "+" : "-"}{formatCurrency(item.amount, item.currency)}
              </Text>
              <StatusBadge status={item.status} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Send your first transfer to get started</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: { padding: 24 },
  greeting: { fontSize: 22, fontWeight: "700", color: colors.accent, marginBottom: 20 },
  balanceCard: { backgroundColor: colors.accent, borderRadius: 20, padding: 28, alignItems: "center", marginBottom: 24 },
  balanceLabel: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 8 },
  balanceAmount: { color: colors.white, fontSize: 40, fontWeight: "700" },
  balanceCurrency: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 4 },
  actions: { flexDirection: "row", gap: 12, marginBottom: 32 },
  actionButton: { flex: 1, backgroundColor: colors.cardBg, borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: colors.cardBorder },
  actionPrimary: { backgroundColor: colors.accent, borderColor: colors.accent },
  actionIcon: { fontSize: 20, fontWeight: "700", color: colors.accent, marginBottom: 4 },
  actionText: { fontSize: 12, fontWeight: "600", color: colors.textPrimary },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  seeAll: { fontSize: 14, fontWeight: "600", color: colors.accent },
  txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  txLeft: { flex: 1, marginRight: 12 },
  txDesc: { fontSize: 15, fontWeight: "500", color: colors.textPrimary, marginBottom: 4 },
  txDate: { fontSize: 12, color: colors.textMuted },
  txRight: { alignItems: "flex-end", gap: 4 },
  txAmount: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: "600", color: colors.textSecondary, marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: colors.textMuted },
});
