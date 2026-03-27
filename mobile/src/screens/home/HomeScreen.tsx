import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, RefreshControl, StyleSheet, SafeAreaView } from "react-native";
import { walletApi, api } from "../../api";
import { formatCurrency, formatDate } from "../../utils/format";
import StatusBadge from "../../components/StatusBadge";
import { useTheme } from "../../utils/theme";

export default function HomeScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
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
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={[styles.greeting, { color: colors.accent }]}>Payvio</Text>
              <View style={styles.avatar}><Text style={styles.avatarText}>P</Text></View>
            </View>

            <View style={[styles.balanceCard, { backgroundColor: isDark ? colors.balanceCardDark : colors.balanceCard }]}>
              <Text style={styles.balanceLabel}>Your Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
              <Text style={styles.balanceCurrency}>USD</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={() => navigation.navigate("AddMoney")}>
                <Text style={[styles.actionIcon, { color: colors.accent }]}>+</Text>
                <Text style={[styles.actionText, { color: colors.text }]}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.accent, borderColor: colors.accent }]} onPress={() => navigation.navigate("Send")}>
                <Text style={[styles.actionIcon, { color: "#fff" }]}>↑</Text>
                <Text style={[styles.actionText, { color: "#fff" }]}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={() => navigation.navigate("PaymentRequest")}>
                <Text style={[styles.actionIcon, { color: colors.accent }]}>↓</Text>
                <Text style={[styles.actionText, { color: colors.text }]}>Request</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent</Text>
              <TouchableOpacity onPress={() => navigation.navigate("History")}>
                <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.txRow, { borderBottomColor: colors.cardBorder }]}
            onPress={() => navigation.navigate("TransactionDetail", { transaction: item })}
          >
            <View style={styles.txLeft}>
              <Text style={[styles.txDesc, { color: colors.text }]}>{item.description}</Text>
              <Text style={[styles.txDate, { color: colors.textMuted }]}>{formatDate(item.created_at)}</Text>
            </View>
            <View style={styles.txRight}>
              <Text style={[styles.txAmount, { color: item.type === "wallet_credit" ? colors.success : colors.text }]}>
                {item.type === "wallet_credit" ? "+" : "-"}{formatCurrency(item.amount, item.currency)}
              </Text>
              <StatusBadge status={item.status} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No transactions yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Send your first transfer to get started</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: "700" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#4f46e5", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  balanceCard: { borderRadius: 20, padding: 28, alignItems: "center", marginBottom: 24 },
  balanceLabel: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 8 },
  balanceAmount: { color: "#fff", fontSize: 40, fontWeight: "700" },
  balanceCurrency: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 4 },
  actions: { flexDirection: "row", gap: 12, marginBottom: 32 },
  actionButton: { flex: 1, borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1 },
  actionIcon: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  actionText: { fontSize: 12, fontWeight: "600" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  seeAll: { fontSize: 14, fontWeight: "600" },
  txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
  txLeft: { flex: 1, marginRight: 12 },
  txDesc: { fontSize: 15, fontWeight: "500", marginBottom: 4 },
  txDate: { fontSize: 12 },
  txRight: { alignItems: "flex-end", gap: 4 },
  txAmount: { fontSize: 15, fontWeight: "700" },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  emptySubtext: { fontSize: 14 },
});
