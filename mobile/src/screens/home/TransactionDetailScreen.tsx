import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Share, Linking } from "react-native";
import StatusBadge from "../../components/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/format";
import { colors } from "../../utils/colors";

export default function TransactionDetailScreen({ route, navigation }: any) {
  const { transaction: tx } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Payvio Transfer\nAmount: ${formatCurrency(tx.amount, tx.currency)}\nStatus: ${tx.status}\nDate: ${formatDate(tx.created_at)}\nID: ${tx.reference_id}`,
      });
    } catch {
      // user cancelled
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.amount}>
            {tx.type === "wallet_credit" ? "+" : "-"}{formatCurrency(tx.amount, tx.currency)}
          </Text>
          <StatusBadge status={tx.status} />
        </View>

        <View style={styles.card}>
          <DetailRow label="Description" value={tx.description} />
          <DetailRow label="Type" value={tx.type.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} />
          <DetailRow label="Status" value={tx.status} />
          <DetailRow label="Currency" value={tx.currency} />
          <DetailRow label="Date" value={formatDate(tx.created_at)} />
          <DetailRow label="Reference ID" value={tx.reference_id.slice(0, 12) + "..."} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Text style={styles.actionText}>Share Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL("mailto:support@payvio.com")}>
            <Text style={styles.actionText}>Need Help?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  label: { fontSize: 14, color: colors.textMuted },
  value: { fontSize: 14, fontWeight: "600", color: colors.textPrimary, maxWidth: "60%", textAlign: "right" },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: { flex: 1, padding: 24 },
  back: { fontSize: 16, color: colors.accent, fontWeight: "600", marginBottom: 24 },
  header: { alignItems: "center", gap: 12, marginBottom: 32 },
  amount: { fontSize: 36, fontWeight: "700", color: colors.textPrimary },
  card: { backgroundColor: colors.cardBg, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 32 },
  actions: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.accent, alignItems: "center" },
  actionText: { fontSize: 14, fontWeight: "600", color: colors.accent },
});
