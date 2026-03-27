import { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import Button from "../../../components/Button";
import { transferApi } from "../../../api";
import { colors } from "../../../utils/colors";

type Props = {
  readonly country: { code: string; name: string; currency: string };
  readonly onSelect: (recipient: any) => void;
  readonly onBack: () => void;
};

export default function RecipientStep({ country, onSelect, onBack }: Props) {
  const [recipients, setRecipients] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    try {
      const { data } = await transferApi.getRecipients();
      const filtered = (data.data ?? []).filter((r: any) => r.country === country.code);
      setRecipients(filtered);
    } catch {
      // silently fail
    }
  };

  const handleAddRecipient = async () => {
    setLoading(true);
    try {
      const { data } = await transferApi.createRecipient({
        country: country.code,
        currency: country.currency,
        first_name: firstName,
        last_name: lastName,
        payout_method: "bank_transfer",
        bank_name: bankName,
        account_number: accountNumber,
      });
      onSelect(data.data);
    } catch {
      alert("Failed to add recipient");
    } finally {
      setLoading(false);
    }
  };

  if (showAdd) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowAdd(false)}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New recipient in {country.name}</Text>
        </View>
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          <TextInput style={styles.input} placeholder="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
          <TextInput style={styles.input} placeholder="Bank name" value={bankName} onChangeText={setBankName} />
          <TextInput style={styles.input} placeholder="Account number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" />
          <Button
            title="Add & Continue"
            onPress={handleAddRecipient}
            loading={loading}
            disabled={!firstName || !lastName || !accountNumber}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choose recipient</Text>
      </View>

      <FlatList
        data={recipients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addNew} onPress={() => setShowAdd(true)}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>Add new recipient</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.recipientRow} onPress={() => onSelect(item)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.first_name[0]}{item.last_name[0]}</Text>
            </View>
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientName}>{item.first_name} {item.last_name}</Text>
              <Text style={styles.recipientBank}>{item.bank_name ?? item.payout_method} • ****{item.account_number?.slice(-4)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No saved recipients for {country.name}. Add one above.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: { padding: 24, paddingBottom: 8 },
  back: { fontSize: 16, color: colors.accent, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary },
  list: { padding: 24, paddingTop: 8 },
  addNew: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, backgroundColor: colors.accentLight, borderRadius: 12, borderWidth: 1, borderColor: colors.accent + "30", borderStyle: "dashed", marginBottom: 16 },
  addIcon: { fontSize: 20, fontWeight: "700", color: colors.accent },
  addText: { fontSize: 16, fontWeight: "600", color: colors.accent },
  recipientRow: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: colors.cardBg, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, justifyContent: "center", alignItems: "center", marginRight: 14 },
  avatarText: { color: colors.white, fontSize: 14, fontWeight: "700" },
  recipientInfo: { flex: 1 },
  recipientName: { fontSize: 16, fontWeight: "600", color: colors.textPrimary },
  recipientBank: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  empty: { fontSize: 14, color: colors.textMuted, textAlign: "center", paddingVertical: 32 },
  form: { padding: 24, gap: 16 },
  input: { borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: colors.cardBg },
});
