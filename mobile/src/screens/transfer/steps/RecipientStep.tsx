import { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import Button from "../../../components/Button";
import { transferApi } from "../../../api";
import { useTheme } from "../../../utils/theme";

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

  const { colors: themeColors } = useTheme();

  if (showAdd) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowAdd(false)}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>New recipient in {country.name}</Text>
        </View>
        <View style={styles.form}>
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>First name</Text>
          <TextInput style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder, color: themeColors.text }]} placeholder="First name" placeholderTextColor={themeColors.textMuted} value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Last name</Text>
          <TextInput style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder, color: themeColors.text }]} placeholder="Last name" placeholderTextColor={themeColors.textMuted} value={lastName} onChangeText={setLastName} autoCapitalize="words" />
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Bank name</Text>
          <TextInput style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder, color: themeColors.text }]} placeholder="e.g. GTBank" placeholderTextColor={themeColors.textMuted} value={bankName} onChangeText={setBankName} />
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Account number</Text>
          <TextInput style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder, color: themeColors.text }]} placeholder="10-digit account number" placeholderTextColor={themeColors.textMuted} value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" maxLength={10} />
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
  safe: { flex: 1 },
  header: { padding: 24, paddingBottom: 8 },
  back: { fontSize: 16, color: "#4f46e5", fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  list: { padding: 24, paddingTop: 8 },
  addNew: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "rgba(79,70,229,0.3)", borderStyle: "dashed", marginBottom: 16 },
  addIcon: { fontSize: 20, fontWeight: "700", color: "#4f46e5" },
  addText: { fontSize: 16, fontWeight: "600", color: "#4f46e5" },
  recipientRow: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#4f46e5", justifyContent: "center", alignItems: "center", marginRight: 14 },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  recipientInfo: { flex: 1 },
  recipientName: { fontSize: 16, fontWeight: "600" },
  recipientBank: { fontSize: 13, marginTop: 2 },
  empty: { fontSize: 14, textAlign: "center", paddingVertical: 32 },
  form: { padding: 24, gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 2, marginTop: 8 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 16, fontSize: 16 },
});
