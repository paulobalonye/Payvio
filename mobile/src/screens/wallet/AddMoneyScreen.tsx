import { useState } from "react";
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import Button from "../../components/Button";
import { walletApi } from "../../api";
import { colors } from "../../utils/colors";

const PRESETS = [5000, 10000, 25000, 50000]; // cents

export default function AddMoneyScreen({ navigation }: any) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amountCents = Math.round(parseFloat(amount || "0") * 100);

  const handleFund = async () => {
    if (amountCents < 1000) {
      setError("Minimum amount is $10.00");
      return;
    }
    if (amountCents > 250000) {
      setError("Maximum amount is $2,500.00");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data } = await walletApi.initiateFunding(amountCents);
      // In production: open Stripe payment sheet with data.data.client_secret
      alert(`Payment Intent created: ${data.data.payment_intent_id}\nUse Stripe SDK to complete.`);
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to initiate funding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Add Money</Text>
        <Text style={styles.subtitle}>Fund your wallet via debit card</Text>

        {/* Amount Input */}
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

        {/* Preset Amounts */}
        <View style={styles.presets}>
          {PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={styles.presetButton}
              onPress={() => setAmount((preset / 100).toFixed(2))}
            >
              <Text style={styles.presetText}>${(preset / 100).toFixed(0)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Add Money" onPress={handleFund} loading={loading} disabled={!amount} />
        <Text style={styles.note}>Powered by Stripe. Your card details are never stored on our servers.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: { flex: 1, padding: 24 },
  back: { marginBottom: 16 },
  backText: { fontSize: 16, color: colors.accent, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 32 },
  amountContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  currencySymbol: { fontSize: 40, fontWeight: "700", color: colors.textPrimary, marginRight: 4 },
  amountInput: { fontSize: 48, fontWeight: "700", color: colors.textPrimary, minWidth: 100, textAlign: "center" },
  presets: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 32 },
  presetButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9999, backgroundColor: colors.accentLight, borderWidth: 1, borderColor: colors.accent + "30" },
  presetText: { fontSize: 14, fontWeight: "600", color: colors.accent },
  error: { color: colors.error, fontSize: 14, textAlign: "center", marginBottom: 16 },
  note: { fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 16 },
});
