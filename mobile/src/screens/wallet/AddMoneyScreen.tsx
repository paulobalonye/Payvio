import { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import Button from "../../components/Button";
import { walletApi } from "../../api";
import { useTheme } from "../../utils/theme";
import { config } from "../../config/env";

const PRESETS = [5000, 10000, 25000, 50000];

function AddMoneyContent({ navigation }: any) {
  const { colors } = useTheme();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amountCents = Math.round(parseFloat(amount || "0") * 100);

  const handleFund = async () => {
    if (amountCents < 1000) { setError("Minimum amount is $10.00"); return; }
    if (amountCents > 250000) { setError("Maximum amount is $2,500.00"); return; }

    setLoading(true);
    setError("");

    try {
      // 1. Create Payment Intent on backend
      const { data } = await walletApi.initiateFunding(amountCents);
      const clientSecret = data.data.client_secret;
      const paymentIntentId = data.data.payment_intent_id ?? data.data.id;

      if (!clientSecret) {
        setError("Could not create payment. Try again.");
        setLoading(false);
        return;
      }

      // 2. Initialize Stripe Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Payvio",
        style: "alwaysDark",
      });

      if (initError) {
        setError(initError.message);
        setLoading(false);
        return;
      }

      // 3. Present Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== "Canceled") {
          setError(paymentError.message);
        }
      } else {
        // 4. Credit wallet after successful payment
        try {
          await walletApi.creditAfterPayment(amountCents, paymentIntentId);
        } catch {
          // Wallet will be credited via webhook as fallback
        }

        Alert.alert("Success!", `$${(amountCents / 100).toFixed(2)} added to your wallet`, [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to process payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={[styles.backText, { color: colors.accent }]}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Add Money</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Fund your wallet via debit card</Text>

        <View style={styles.amountContainer}>
          <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
          <TextInput
            style={[styles.amountInput, { color: colors.text }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        <View style={styles.presets}>
          {PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[styles.presetButton, { backgroundColor: colors.accentLight, borderColor: colors.accent + "30" }]}
              onPress={() => setAmount((preset / 100).toFixed(2))}
            >
              <Text style={[styles.presetText, { color: colors.accent }]}>${(preset / 100).toFixed(0)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <View style={{ flex: 1 }} />

        <Button title="Add Money" onPress={handleFund} loading={loading} disabled={!amount} />
        <Text style={[styles.note, { color: colors.textMuted }]}>Powered by Stripe. Your card details are never stored on our servers.</Text>
      </View>
    </SafeAreaView>
  );
}

export default function AddMoneyScreen({ navigation }: any) {
  return (
    <StripeProvider publishableKey={config.STRIPE_PUBLISHABLE_KEY}>
      <AddMoneyContent navigation={navigation} />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24 },
  back: { marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32 },
  amountContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  currencySymbol: { fontSize: 40, fontWeight: "700", marginRight: 4 },
  amountInput: { fontSize: 48, fontWeight: "700", minWidth: 100, textAlign: "center" },
  presets: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 32 },
  presetButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9999, borderWidth: 1 },
  presetText: { fontSize: 14, fontWeight: "600" },
  error: { fontSize: 14, textAlign: "center", marginBottom: 16 },
  note: { fontSize: 12, textAlign: "center", marginTop: 16 },
});
