import { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import { useTheme } from "../../utils/theme";

export default function SavedCardsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [cards] = useState<any[]>([]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Saved Cards</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage your debit and credit cards for quick payments.
        </Text>

        {cards.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No saved cards</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Cards are saved automatically when you make a payment</Text>
          </View>
        ) : (
          cards.map((card, i) => (
            <View key={i} style={[styles.cardRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="card" size={24} color={colors.accent} />
              <View style={styles.cardInfo}>
                <Text style={[styles.cardLabel, { color: colors.text }]}>•••• {card.last4}</Text>
                <Text style={[styles.cardBrand, { color: colors.textMuted }]}>{card.brand} · Expires {card.exp}</Text>
              </View>
              <TouchableOpacity>
                <Text style={{ color: colors.error, fontSize: 13, fontWeight: "600" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={{ flex: 1 }} />

        <Text style={[styles.note, { color: colors.textMuted }]}>
          Card details are securely stored by Stripe. Payvio never stores your full card number.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24 },
  back: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySubtext: { fontSize: 14, textAlign: "center", maxWidth: 260 },
  cardRow: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 12, gap: 14 },
  cardInfo: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: "600" },
  cardBrand: { fontSize: 13, marginTop: 2 },
  note: { fontSize: 12, textAlign: "center" },
});
