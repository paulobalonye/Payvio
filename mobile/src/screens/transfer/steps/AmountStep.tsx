import { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import Button from "../../../components/Button";
import { transferApi } from "../../../api";
import { formatCurrency } from "../../../utils/format";
import { colors } from "../../../utils/colors";

type Props = {
  readonly country: { code: string; name: string; currency: string };
  readonly onConfirm: (data: { sendAmount: number; rate: any }) => void;
  readonly onBack: () => void;
};

export default function AmountStep({ country, onConfirm, onBack }: Props) {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState<any>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  const sendAmountCents = Math.round(parseFloat(amount || "0") * 100);
  const receiveAmount = rate ? sendAmountCents * rate.our_rate : 0;

  useEffect(() => {
    fetchRate();
    const interval = setInterval(fetchRate, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchRate = async () => {
    try {
      const { data } = await transferApi.getRate("USD", country.currency);
      setRate(data.data);
    } catch {
      // retry on next interval
    } finally {
      setLoadingRate(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Send to {country.name}</Text>

        {/* You Send */}
        <Text style={styles.label}>You send</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currency}>USD</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        {/* Rate Info */}
        <View style={styles.rateBox}>
          {loadingRate ? (
            <ActivityIndicator color={colors.accent} />
          ) : rate ? (
            <>
              <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>Rate</Text>
                <Text style={styles.rateValue}>1 USD = {rate.our_rate.toFixed(2)} {country.currency}</Text>
              </View>
              <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>Fee</Text>
                <Text style={styles.rateValue}>{formatCurrency(rate.fee)}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.rateError}>Failed to load rate</Text>
          )}
        </View>

        {/* They Receive */}
        <Text style={styles.label}>They receive</Text>
        <View style={styles.receiveRow}>
          <Text style={styles.currency}>{country.currency}</Text>
          <Text style={styles.receiveAmount}>
            {receiveAmount > 0 ? (receiveAmount / 100).toFixed(2) : "0.00"}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <Button
          title="Continue"
          onPress={() => onConfirm({ sendAmount: sendAmountCents, rate })}
          disabled={!amount || sendAmountCents < 1000 || !rate}
        />
        {sendAmountCents > 0 && sendAmountCents < 1000 && (
          <Text style={styles.minNote}>Minimum transfer: $10.00</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: { flex: 1, padding: 24 },
  back: { fontSize: 16, color: colors.accent, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary, marginBottom: 24 },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  amountRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  currency: { fontSize: 16, fontWeight: "600", color: colors.textSecondary, backgroundColor: colors.cardBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.cardBorder },
  amountInput: { flex: 1, fontSize: 36, fontWeight: "700", color: colors.textPrimary },
  rateBox: { backgroundColor: colors.cardBg, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 24 },
  rateRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  rateLabel: { fontSize: 14, color: colors.textMuted },
  rateValue: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  rateError: { fontSize: 14, color: colors.error, textAlign: "center" },
  receiveRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  receiveAmount: { fontSize: 36, fontWeight: "700", color: colors.accent },
  minNote: { fontSize: 12, color: colors.error, textAlign: "center", marginTop: 8 },
});
