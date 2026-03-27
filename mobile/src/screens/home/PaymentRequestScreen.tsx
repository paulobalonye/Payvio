import { useState } from "react";
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Share } from "react-native";
import Button from "../../components/Button";
import { api } from "../../api";
import { colors } from "../../utils/colors";

export default function PaymentRequestScreen({ navigation }: any) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ token: string; url: string } | null>(null);

  const amountCents = Math.round(parseFloat(amount || "0") * 100);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/payment-requests", {
        amount: amountCents,
        currency: "USD",
        note: note || undefined,
      });
      setResult({ token: data.data.token, url: `https://pay.payvio.com/${data.data.token}` });
    } catch (err: any) {
      alert(err.response?.data?.error ?? "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    try {
      await Share.share({
        message: `Pay me ${amount} USD on Payvio: ${result.url}`,
        url: result.url,
      });
    } catch {
      // cancelled
    }
  };

  if (result) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Request Created!</Text>
          <Text style={styles.successAmount}>${amount}</Text>
          <Text style={styles.successNote}>Share the link below with anyone</Text>

          <View style={styles.linkBox}>
            <Text style={styles.link} numberOfLines={1}>{result.url}</Text>
          </View>

          <Button title="Share Link" onPress={handleShare} />
          <Button title="Done" onPress={() => navigation.goBack()} variant="outline" style={{ marginTop: 12 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Request Money</Text>
        <Text style={styles.subtitle}>Create a payment link anyone can pay</Text>

        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="What's it for? (optional)"
          maxLength={500}
        />

        <View style={{ flex: 1 }} />

        <Button title="Generate Link" onPress={handleCreate} loading={loading} disabled={!amount || amountCents < 100} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: { flex: 1, padding: 24 },
  back: { fontSize: 16, color: colors.accent, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 32 },
  amountContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  currencySymbol: { fontSize: 40, fontWeight: "700", color: colors.textPrimary, marginRight: 4 },
  amountInput: { fontSize: 48, fontWeight: "700", color: colors.textPrimary, minWidth: 100, textAlign: "center" },
  noteInput: { borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: colors.cardBg },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.successBg, justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 24, marginTop: 60 },
  successEmoji: { fontSize: 36, color: colors.success, fontWeight: "700" },
  successTitle: { fontSize: 24, fontWeight: "700", color: colors.textPrimary, textAlign: "center", marginBottom: 8 },
  successAmount: { fontSize: 40, fontWeight: "700", color: colors.accent, textAlign: "center", marginBottom: 8 },
  successNote: { fontSize: 16, color: colors.textSecondary, textAlign: "center", marginBottom: 24 },
  linkBox: { backgroundColor: colors.cardBg, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 24 },
  link: { fontSize: 14, color: colors.accent, fontWeight: "500" },
});
