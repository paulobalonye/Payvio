import { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Modal, ActivityIndicator, ScrollView } from "react-native";
import Button from "../../../components/Button";
import { transferApi, walletApi } from "../../../api";
import { useTheme } from "../../../utils/theme";

type Props = {
  readonly country: { code: string; name: string; currency: string };
  readonly onSelect: (recipient: any) => void;
  readonly onBack: () => void;
};

export default function RecipientStep({ country, onSelect, onBack }: Props) {
  const { colors } = useTheme();
  const [recipients, setRecipients] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState("");

  useEffect(() => { loadRecipients(); }, []);

  useEffect(() => {
    if (showAdd && country.code === "NG") {
      walletApi.getBankList(country.code).then(r => setBanks(r.data.data ?? [])).catch(() => {});
    }
  }, [showAdd]);

  // Auto-verify account when 10 digits entered
  useEffect(() => {
    if (accountNumber.length === 10 && bankCode && country.code === "NG") {
      verifyAccount();
    } else {
      setVerifiedName("");
    }
  }, [accountNumber, bankCode]);

  const loadRecipients = async () => {
    try {
      const { data } = await transferApi.getRecipients();
      const filtered = (data.data ?? []).filter((r: any) => r.country === country.code);
      setRecipients(filtered);
    } catch {}
  };

  const verifyAccount = async () => {
    setVerifying(true);
    try {
      const { data } = await walletApi.verifyBankAccount(accountNumber, bankCode, country.code);
      setVerifiedName(data.data.account_name);
    } catch {
      setVerifiedName("");
    } finally {
      setVerifying(false);
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

  const filteredBanks = banks.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  // === ADD NEW RECIPIENT ===
  if (showAdd) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={() => setShowAdd(false)}>
            <Text style={[styles.back, { color: colors.accent }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.text }]}>New recipient in {country.name}</Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>First name</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="First name" placeholderTextColor={colors.textMuted}
            value={firstName} onChangeText={setFirstName} autoCapitalize="words" />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Last name</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="Last name" placeholderTextColor={colors.textMuted}
            value={lastName} onChangeText={setLastName} autoCapitalize="words" />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Bank</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            onPress={() => setShowBankPicker(true)}
          >
            <Text style={{ color: bankName ? colors.text : colors.textMuted, fontSize: 16 }}>
              {bankName || "Select a bank..."}
            </Text>
            <Text style={{ color: colors.textMuted }}>▼</Text>
          </TouchableOpacity>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Account number</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="10-digit account number" placeholderTextColor={colors.textMuted}
            value={accountNumber} onChangeText={setAccountNumber}
            keyboardType="number-pad" maxLength={10} />

          {verifying && <ActivityIndicator color={colors.accent} style={{ marginTop: 8 }} />}
          {verifiedName ? (
            <View style={[styles.verified, { backgroundColor: colors.successBg }]}>
              <Text style={[styles.verifiedText, { color: colors.success }]}>✓ {verifiedName}</Text>
            </View>
          ) : null}

          <View style={{ height: 16 }} />
          <Button
            title="Add & Continue"
            onPress={handleAddRecipient}
            loading={loading}
            disabled={!firstName || !lastName || !accountNumber || !bankName}
          />

          {/* Bank Picker Modal */}
          <Modal visible={showBankPicker} animationType="slide" transparent>
            <View style={[styles.modalOverlay]}>
              <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Select Bank</Text>
                  <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                    <Text style={[styles.modalClose, { color: colors.accent }]}>Done</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.searchInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder="Search banks..."
                  placeholderTextColor={colors.textMuted}
                  value={bankSearch}
                  onChangeText={setBankSearch}
                  autoFocus
                />
                <FlatList
                  data={filteredBanks}
                  keyExtractor={(item) => item.code ?? item.id?.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.bankRow, { borderBottomColor: colors.cardBorder }]}
                      onPress={() => {
                        setBankName(item.name);
                        setBankCode(item.code);
                        setShowBankPicker(false);
                        setBankSearch("");
                      }}
                    >
                      <Text style={[styles.bankName, { color: colors.text }]}>{item.name}</Text>
                      {bankName === item.name && <Text style={{ color: colors.accent }}>✓</Text>}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                      {banks.length === 0 ? "Loading banks..." : "No banks found"}
                    </Text>
                  }
                />
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // === RECIPIENT LIST ===
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={[styles.back, { color: colors.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Choose recipient</Text>
      </View>

      <FlatList
        data={recipients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity style={[styles.addNew, { backgroundColor: colors.accentLight, borderColor: colors.accent + "30" }]} onPress={() => setShowAdd(true)}>
            <Text style={[styles.addIcon, { color: colors.accent }]}>+</Text>
            <Text style={[styles.addText, { color: colors.accent }]}>Add new recipient</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.recipientRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={() => onSelect(item)}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.first_name?.[0]}{item.last_name?.[0]}</Text></View>
            <View style={styles.recipientInfo}>
              <Text style={[styles.recipientName, { color: colors.text }]}>{item.first_name} {item.last_name}</Text>
              <Text style={[styles.recipientBank, { color: colors.textMuted }]}>{item.bank_name ?? item.payout_method} · ****{item.account_number?.slice(-4)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No saved recipients for {country.name}. Add one above.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24 },
  header: { padding: 24, paddingBottom: 8 },
  back: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: "800", marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 16, fontSize: 16 },
  selectInput: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  verified: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 10, marginTop: 8 },
  verifiedText: { fontSize: 14, fontWeight: "600" },
  list: { padding: 24, paddingTop: 8 },
  addNew: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", marginBottom: 16 },
  addIcon: { fontSize: 20, fontWeight: "700" },
  addText: { fontSize: 16, fontWeight: "600" },
  recipientRow: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#4f46e5", justifyContent: "center", alignItems: "center", marginRight: 14 },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  recipientInfo: { flex: 1 },
  recipientName: { fontSize: 16, fontWeight: "600" },
  recipientBank: { fontSize: 13, marginTop: 2 },
  emptyText: { fontSize: 14, textAlign: "center", paddingVertical: 32 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", paddingBottom: 34 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalClose: { fontSize: 16, fontWeight: "600" },
  searchInput: { marginHorizontal: 20, marginBottom: 12, borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  bankRow: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between" },
  bankName: { fontSize: 15 },
});
