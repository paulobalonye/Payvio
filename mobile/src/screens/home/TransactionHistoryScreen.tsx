import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, RefreshControl } from "react-native";
import { api } from "../../api";
import { formatCurrency, formatDate } from "../../utils/format";
import StatusBadge from "../../components/StatusBadge";
import { colors } from "../../utils/colors";

const FILTERS = ["all", "transfer", "wallet_credit", "wallet_debit", "payment_request"] as const;
const FILTER_LABELS: Record<string, string> = {
  all: "All",
  transfer: "Sends",
  wallet_credit: "Received",
  wallet_debit: "Debits",
  payment_request: "Requests",
};

export default function TransactionHistoryScreen({ navigation }: any) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async (reset = false) => {
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (filter !== "all") params.set("type", filter);
      if (!reset && cursor) params.set("cursor", cursor);

      const { data } = await api.get(`/transactions?${params}`);
      const newTxs = data.data ?? [];

      setTransactions(reset ? newTxs : [...transactions, ...newTxs]);
      setHasMore(data.meta?.has_more ?? false);
      if (newTxs.length > 0) setCursor(data.meta?.cursor);
    } catch {
      // silently fail
    }
  }, [filter, cursor]);

  useEffect(() => {
    setCursor(null);
    fetchTransactions(true);
  }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    setCursor(null);
    await fetchTransactions(true);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {FILTER_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        onEndReached={() => hasMore && fetchTransactions()}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.txRow}
            onPress={() => navigation.navigate("TransactionDetail", { transaction: item })}
          >
            <View style={styles.txLeft}>
              <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
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
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: { padding: 24, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", color: colors.textPrimary },
  filters: { flexDirection: "row", paddingHorizontal: 24, gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999, backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.cardBorder },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  list: { paddingHorizontal: 24 },
  txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  txLeft: { flex: 1, marginRight: 12 },
  txDesc: { fontSize: 15, fontWeight: "500", color: colors.textPrimary, marginBottom: 4 },
  txDate: { fontSize: 12, color: colors.textMuted },
  txRight: { alignItems: "flex-end", gap: 4 },
  txAmount: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: colors.textMuted },
});
