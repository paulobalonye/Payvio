import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { walletApi } from "../../../api";
import { formatCurrency } from "../../../utils/format";
import { useTheme } from "../../../utils/theme";
import Button from "../../../components/Button";

type FundingSource = {
  readonly type: string;
  readonly label: string;
};

type Props = {
  readonly amount: number;
  readonly onSelect: (source: FundingSource) => void;
  readonly onBack: () => void;
};

export default function FundingSourceStep({ amount, onSelect, onBack }: Props) {
  const { colors } = useTheme();
  const [walletBalance, setWalletBalance] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    walletApi.getWallet("USD").then(r => setWalletBalance(r.data.data?.balance ?? 0)).catch(() => {});
  }, []);

  const sources = [
    {
      id: "wallet",
      icon: "wallet" as const,
      label: "Payvio Wallet",
      detail: `Balance: ${formatCurrency(walletBalance)}`,
      disabled: walletBalance < amount,
      disabledReason: "Insufficient balance",
    },
    {
      id: "card",
      icon: "card" as const,
      label: "Debit Card",
      detail: "Pay with your debit or credit card",
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
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        <Button
          title="Continue"
          onPress={() => {
            if (selected) {
              const source = sources.find(s => s.id === selected);
              onSelect({ type: selected, label: source?.label ?? selected });
            }
          }}
          disabled={!selected}
        />
      </View>
    </SafeAreaView>
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
});
