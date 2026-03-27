import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native";
import { StripeProvider, useStripe, CardField } from "@stripe/stripe-react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { walletApi } from "../../../api";
import { formatCurrency } from "../../../utils/format";
import { useTheme } from "../../../utils/theme";
import Button from "../../../components/Button";

const STRIPE_PK = "pk_test_51T1GESJ6Hy0kXTetc16ca2PvuIRVHHy69dlA9UQN5ky9Op8lKO43Y0KrhmP7YXFDviUIq7fqwM1lqTPpf5H9l14M008YB9GE0I";

type FundingSource = { readonly type: string; readonly label: string };

type Props = {
  readonly amount: number;
  readonly onSelect: (source: FundingSource) => void;
  readonly onBack: () => void;
};

function FundingSourceContent({ amount, onSelect, onBack }: Props) {
  const { colors, isDark } = useTheme();
  const { createToken } = useStripe();
  const [walletBalance, setWalletBalance] = useState(0);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showCardEntry, setShowCardEntry] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    walletApi.getWallet("USD").then(r => setWalletBalance(r.data.data?.balance ?? 0)).catch(() => {});
    SecureStore.getItemAsync("saved_cards").then(stored => {
      if (stored) setSavedCards(JSON.parse(stored));
    }).catch(() => {});
  }, []);

  const handleContinue = () => {
    if (!selected) return;

    if (selected === "new-card") {
      setShowCardEntry(true);
      return;
    }

    const source = sources.find(s => s.id === selected);
    onSelect({ type: selected, label: source?.label ?? selected });
  };

  const handleSaveCardAndContinue = async () => {
    setSaving(true);
    try {
      const { token, error } = await createToken({ type: "Card" });
      if (error) { Alert.alert("Error", error.message); setSaving(false); return; }

      if (token?.card) {
        const newCard = {
          id: token.id,
          last4: token.card.last4 ?? "****",
          brand: token.card.brand ?? "Card",
          expMonth: token.card.expMonth ?? 0,
          expYear: token.card.expYear ?? 0,
        };

        // Save card
        const existing = savedCards.filter(c => !(c.last4 === newCard.last4 && c.brand === newCard.brand));
        const updated = [...existing, newCard];
        await SecureStore.setItemAsync("saved_cards", JSON.stringify(updated));

        // Continue with this card
        onSelect({ type: `card-${token.id}`, label: `${newCard.brand} •••• ${newCard.last4}` });
      }
    } catch {
      Alert.alert("Error", "Failed to save card");
    } finally {
      setSaving(false);
    }
  };

  const sources: any[] = [
    {
      id: "wallet",
      icon: "wallet" as const,
      label: "Payvio Wallet",
      detail: `Balance: ${formatCurrency(walletBalance)}`,
      disabled: walletBalance < amount,
      disabledReason: "Insufficient balance",
    },
    ...savedCards.map(card => ({
      id: `card-${card.id}`,
      icon: "card" as const,
      label: `${card.brand} •••• ${card.last4}`,
      detail: `Expires ${String(card.expMonth).padStart(2, "0")}/${String(card.expYear).slice(-2)}`,
      disabled: false,
    })),
    {
      id: "new-card",
      icon: "add-circle-outline" as const,
      label: "Debit / Credit Card",
      detail: "Enter card details",
      disabled: false,
    },
    {
      id: "bank",
      icon: "business" as const,
      label: "Linked Bank Account",
      detail: "Pay via ACH bank transfer",
      disabled: true,
      disabledReason: "Coming soon",
    },
  ];

  // Card entry form
  if (showCardEntry) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => setShowCardEntry(false)}>
            <Text style={[styles.back, { color: colors.accent }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Enter card details</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your card will be saved for future payments
          </Text>

          <View style={[styles.cardFormBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: "4242 4242 4242 4242" }}
              cardStyle={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                textColor: isDark ? "#f1f5f9" : "#0f172a",
                borderColor: isDark ? "#334155" : "#e2e8f0",
                borderWidth: 1,
                borderRadius: 12,
                fontSize: 16,
                placeholderColor: isDark ? "#64748b" : "#94a3b8",
              }}
              style={styles.cardField}
              onCardChange={(details) => setCardComplete(details.complete)}
            />
          </View>

          <View style={{ flex: 1 }} />

          <Button title="Save Card & Continue" onPress={handleSaveCardAndContinue} loading={saving} disabled={!cardComplete} />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            Card details are securely processed by Stripe
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack}>
          <Text style={[styles.back, { color: colors.accent }]}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Funding source</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          How would you like to pay {formatCurrency(amount)}?
        </Text>

        <View style={styles.sources}>
          {sources.map((source) => {
            const isSelected = selected === source.id;
            const isDisabled = source.disabled;
            return (
              <TouchableOpacity
                key={source.id}
                style={[
                  styles.sourceCard,
                  { backgroundColor: colors.card, borderColor: isSelected ? colors.accent : colors.cardBorder },
                  isSelected && { borderWidth: 2 },
                  isDisabled && { opacity: 0.5 },
                ]}
                onPress={() => !isDisabled && setSelected(source.id)}
                disabled={isDisabled}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name={source.icon} size={24} color={colors.accent} />
                </View>
                <View style={styles.sourceInfo}>
                  <Text style={[styles.sourceLabel, { color: colors.text }]}>{source.label}</Text>
                  <Text style={[styles.sourceDetail, { color: isDisabled ? colors.error : colors.textMuted }]}>
                    {isDisabled && source.disabledReason ? source.disabledReason : source.detail}
                  </Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.accent} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        <Button title="Continue" onPress={handleContinue} disabled={!selected} />
      </View>
    </SafeAreaView>
  );
}

export default function FundingSourceStep(props: Props) {
  return (
    <StripeProvider publishableKey={STRIPE_PK}>
      <FundingSourceContent {...props} />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24 },
  back: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 15, marginBottom: 24 },
  sources: { gap: 12 },
  sourceCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 14, borderWidth: 1.5, gap: 14 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  sourceInfo: { flex: 1 },
  sourceLabel: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  sourceDetail: { fontSize: 13 },
  cardFormBox: { borderRadius: 16, padding: 20, borderWidth: 1, marginTop: 8 },
  cardField: { width: "100%", height: 50, marginVertical: 8 },
  note: { fontSize: 12, textAlign: "center", marginTop: 12 },
});
