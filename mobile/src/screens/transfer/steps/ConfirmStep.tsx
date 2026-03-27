import { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import Button from "../../../components/Button";
import { transferApi } from "../../../api";
import { formatCurrency } from "../../../utils/format";
import { colors } from "../../../utils/colors";

type Props = {
  readonly recipient: any;
  readonly amount: { sendAmount: number; rate: any };
  readonly country: { code: string; name: string; currency: string };
  readonly onSuccess: (transferId: string) => void;
  readonly onBack: () => void;
};

export default function ConfirmStep({ recipient, amount, country, onSuccess, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const receiveAmount = Math.round(amount.sendAmount * amount.rate.our_rate);

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const idempotencyKey = crypto.randomUUID();
      const { data } = await transferApi.createTransfer({
        recipient_id: recipient.id,
        send_amount: amount.sendAmount,
        send_currency: "USD",
        receive_currency: country.currency,
        rate_id: amount.rate.rate_id,
        idempotency_key: idempotencyKey,
      });
      onSuccess(data.data.id);
    } catch (err: any) {
      const msg = err.response?.data?.error;
      if (msg?.includes("Insufficient")) {
        setError("Insufficient balance. Add money to your wallet first.");
      } else if (msg?.includes("expired")) {
        setError("Rate expired. Please go back and try again.");
      } else {
        setError(msg ?? "Transfer failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Confirm transfer</Text>

        <View style={styles.card}>
          <Row label="Recipient" value={`${recipient.first_name} ${recipient.last_name}`} />
          <Row label="Country" value={country.name} />
          <Row label="You send" value={formatCurrency(amount.sendAmount)} />
          <Row label="They receive" value={`${(receiveAmount / 100).toFixed(2)} ${country.currency}`} highlight />
          <Row label="Exchange rate" value={`1 USD = ${amount.rate.our_rate.toFixed(2)} ${country.currency}`} />
          <Row label="Fee" value={formatCurrency(amount.rate.fee)} />
          <Row label="Delivery" value="~3 minutes" />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ flex: 1 }} />

        <Button title="Confirm & Send" onPress={handleConfirm} loading={loading} />
        <Text style={styles.note}>By confirming, you authorize this transfer from your USD wallet.</Text>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, highlight && { color: colors.accent, fontWeight: "700" }]}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  label: { fontSize: 14, color: colors.textMuted },
  value: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: { flex: 1, padding: 24 },
  back: { fontSize: 16, color: colors.accent, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary, marginBottom: 24 },
  card: { backgroundColor: colors.cardBg, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 24 },
  error: { color: colors.error, fontSize: 14, textAlign: "center", marginBottom: 16 },
  note: { fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 12 },
});
