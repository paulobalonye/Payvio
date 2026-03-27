import { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { transferApi } from "../../api";
import { formatCurrency, formatDate } from "../../utils/format";
import StatusBadge from "../../components/StatusBadge";
import { colors } from "../../utils/colors";

const STEPS = ["initiated", "processing", "delivered"] as const;

export default function TransferTrackingScreen({ route, navigation }: any) {
  const { transferId } = route.params;
  const [transfer, setTransfer] = useState<any>(null);

  useEffect(() => {
    fetchTransfer();
    const interval = setInterval(fetchTransfer, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchTransfer = async () => {
    try {
      const { data } = await transferApi.getTransfer(transferId);
      setTransfer(data.data);
    } catch {
      // retry
    }
  };

  const currentStepIndex = transfer
    ? STEPS.indexOf(transfer.status as any)
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate("Tabs")}>
          <Text style={styles.back}>← Home</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Transfer Status</Text>

        {transfer && (
          <>
            {/* Amount */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>You sent</Text>
              <Text style={styles.amount}>{formatCurrency(transfer.send_amount, transfer.send_currency)}</Text>
              <StatusBadge status={transfer.status} />
            </View>

            {/* Step Tracker */}
            <View style={styles.tracker}>
              {STEPS.map((step, i) => {
                const isActive = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <View key={step} style={styles.stepRow}>
                    <View style={styles.stepIndicator}>
                      <View style={[styles.dot, isActive && styles.dotActive, isCurrent && styles.dotCurrent]} />
                      {i < STEPS.length - 1 && (
                        <View style={[styles.line, isActive && styles.lineActive]} />
                      )}
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, isActive && styles.stepTitleActive]}>
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </Text>
                      {isCurrent && step === "processing" && (
                        <Text style={styles.eta}>Estimated: ~3 minutes</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Details */}
            <View style={styles.details}>
              <DetailRow label="Transfer ID" value={transfer.id.slice(0, 8).toUpperCase()} />
              <DetailRow label="Rate" value={`1 USD = ${transfer.fx_rate.toFixed(2)} ${transfer.receive_currency}`} />
              <DetailRow label="Fee" value={formatCurrency(transfer.fee)} />
              <DetailRow label="They receive" value={formatCurrency(transfer.receive_amount, transfer.receive_currency)} />
              <DetailRow label="Date" value={formatDate(transfer.created_at)} />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  label: { fontSize: 14, color: colors.textMuted },
  value: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: { flex: 1, padding: 24 },
  back: { fontSize: 16, color: colors.accent, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary, marginBottom: 24 },
  amountCard: { backgroundColor: colors.cardBg, borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 32, gap: 8 },
  amountLabel: { fontSize: 13, color: colors.textMuted },
  amount: { fontSize: 32, fontWeight: "700", color: colors.textPrimary },
  tracker: { marginBottom: 32 },
  stepRow: { flexDirection: "row", minHeight: 56 },
  stepIndicator: { width: 32, alignItems: "center" },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.cardBorder, borderWidth: 2, borderColor: colors.cardBorder },
  dotActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  dotCurrent: { borderColor: colors.accent, backgroundColor: colors.white, borderWidth: 3 },
  line: { width: 2, flex: 1, backgroundColor: colors.cardBorder, marginVertical: 2 },
  lineActive: { backgroundColor: colors.accent },
  stepContent: { marginLeft: 12, paddingBottom: 16 },
  stepTitle: { fontSize: 16, fontWeight: "500", color: colors.textMuted },
  stepTitleActive: { color: colors.textPrimary, fontWeight: "600" },
  eta: { fontSize: 13, color: colors.accent, marginTop: 4 },
  details: { backgroundColor: colors.cardBg, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.cardBorder },
});
