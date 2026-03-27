import { useState, useCallback } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, FlatList } from "react-native";
import { StripeProvider, useStripe, CardField } from "@stripe/stripe-react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import Button from "../../components/Button";
import { useTheme } from "../../utils/theme";
import { useFocusEffect } from "@react-navigation/native";

const STRIPE_PK = "pk_test_51T1GESJ6Hy0kXTetc16ca2PvuIRVHHy69dlA9UQN5ky9Op8lKO43Y0KrhmP7YXFDviUIq7fqwM1lqTPpf5H9l14M008YB9GE0I";

type SavedCard = {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
};

function SavedCardsContent({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { createToken } = useStripe();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load cards from SecureStore on focus
  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );

  const loadCards = async () => {
    try {
      const stored = await SecureStore.getItemAsync("saved_cards");
      if (stored) setCards(JSON.parse(stored));
    } catch {}
  };

  const saveCardsToStore = async (updatedCards: SavedCard[]) => {
    await SecureStore.setItemAsync("saved_cards", JSON.stringify(updatedCards));
    setCards(updatedCards);
  };

  const handleAddCard = async () => {
    setSaving(true);
    try {
      const { token, error } = await createToken({ type: "Card" });

      if (error) {
        Alert.alert("Error", error.message);
        setSaving(false);
        return;
      }

      if (token?.card) {
        const newCard: SavedCard = {
          id: token.id,
          last4: token.card.last4 ?? "****",
          brand: token.card.brand ?? "Card",
          expMonth: token.card.expMonth ?? 0,
          expYear: token.card.expYear ?? 0,
        };

        // Check duplicate
        const exists = cards.some(c => c.last4 === newCard.last4 && c.brand === newCard.brand);
        if (exists) {
          Alert.alert("Card already saved", "This card is already in your saved cards.");
          setSaving(false);
          setShowAddCard(false);
          return;
        }

        const updatedCards = [...cards, newCard];
        await saveCardsToStore(updatedCards);
        setShowAddCard(false);
        Alert.alert("Card Saved", `${newCard.brand} ending in ${newCard.last4} has been saved.`);
      }
    } catch (err: any) {
      Alert.alert("Error", "Failed to save card. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCard = (cardId: string) => {
    Alert.alert("Remove Card", "Are you sure you want to remove this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const updatedCards = cards.filter(c => c.id !== cardId);
          await saveCardsToStore(updatedCards);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Saved Cards</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Add and manage your debit and credit cards.
        </Text>

        {/* Add Card Form */}
        {showAddCard ? (
          <View style={[styles.addCardForm, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.addCardTitle, { color: colors.text }]}>Add New Card</Text>
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
            <View style={styles.addCardButtons}>
              <Button title="Save Card" onPress={handleAddCard} loading={saving} disabled={!cardComplete} />
              <Button title="Cancel" onPress={() => setShowAddCard(false)} variant="outline" style={{ marginTop: 8 }} />
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addCardButton, { backgroundColor: colors.accentLight, borderColor: colors.accent + "30" }]}
            onPress={() => setShowAddCard(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
            <Text style={[styles.addCardText, { color: colors.accent }]}>Add New Card</Text>
          </TouchableOpacity>
        )}

        {/* Saved Cards List */}
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          style={{ marginTop: 16 }}
          renderItem={({ item }) => (
            <View style={[styles.cardRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="card" size={28} color={colors.accent} />
              <View style={styles.cardInfo}>
                <Text style={[styles.cardLabel, { color: colors.text }]}>•••• •••• •••• {item.last4}</Text>
                <Text style={[styles.cardBrand, { color: colors.textMuted }]}>
                  {item.brand} · Expires {item.expMonth.toString().padStart(2, "0")}/{item.expYear.toString().slice(-2)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveCard(item.id)} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            !showAddCard ? (
              <View style={styles.empty}>
                <Ionicons name="card-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No saved cards yet</Text>
                <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                  Tap "Add New Card" to save a card for quick payments
                </Text>
              </View>
            ) : null
          }
        />

        <Text style={[styles.note, { color: colors.textMuted }]}>
          Card details are tokenized by Stripe. Payvio never stores your full card number.
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function SavedCardsScreen({ navigation }: any) {
  return (
    <StripeProvider publishableKey={STRIPE_PK}>
      <SavedCardsContent navigation={navigation} />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24 },
  back: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  addCardButton: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed" },
  addCardText: { fontSize: 16, fontWeight: "600" },
  addCardForm: { borderRadius: 16, padding: 20, borderWidth: 1, marginBottom: 8 },
  addCardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 16 },
  cardField: { width: "100%", height: 50, marginBottom: 16 },
  addCardButtons: {},
  cardRow: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 12, gap: 14 },
  cardInfo: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: "600", letterSpacing: 1 },
  cardBrand: { fontSize: 13, marginTop: 2 },
  removeBtn: { padding: 8 },
  empty: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySubtext: { fontSize: 14, textAlign: "center", maxWidth: 260 },
  note: { fontSize: 12, textAlign: "center", marginTop: 16 },
});
