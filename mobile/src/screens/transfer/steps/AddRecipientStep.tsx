import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import Button from "../../../components/Button";
import { transferApi, walletApi } from "../../../api";
import { useTheme } from "../../../utils/theme";

type PayoutMethod = "bank_transfer" | "mobile_money" | "cash_pickup";
type Step = "form" | "confirm" | "success";

const METHODS: { key: PayoutMethod; icon: string; label: string }[] = [
  { key: "bank_transfer", icon: "🏦", label: "Bank Transfer" },
  { key: "mobile_money", icon: "📱", label: "Mobile Money" },
  { key: "cash_pickup", icon: "💵", label: "Cash Pickup" },
];

const FALLBACK_PROVIDERS = [
  { id: "mpesa", name: "M-Pesa", icon: "🟢" },
  { id: "mtn", name: "MTN MoMo", icon: "🟡" },
  { id: "airtel", name: "Airtel Money", icon: "🔵" },
];

type Props = {
  readonly country: { code: string; name: string; currency: string };
  readonly onSaved: (recipient: any) => void;
  readonly onBack: () => void;
};

export default function AddRecipientStep({ country, onSaved, onBack }: Props) {
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState<Step>("form");
  const [method, setMethod] = useState<PayoutMethod>("bank_transfer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileProvider, setMobileProvider] = useState("mpesa");
  const [banks, setBanks] = useState<any[]>([]);
  const [momoProviders, setMomoProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedMomoName, setVerifiedMomoName] = useState("");
  const [savedRecipient, setSavedRecipient] = useState<any>(null);

  const isNG = country.code === "NG";

  // Fetch bank list (Flutterwave for NG, YellowCard networks for others)
  useEffect(() => {
    if (method === "bank_transfer") {
      walletApi.getBankList(country.code).then(r => setBanks(r.data.data ?? [])).catch(() => {});
    }
  }, [method, country.code]);

  // Fetch mobile money providers from YellowCard networks for non-NG
  useEffect(() => {
    if (method === "mobile_money" && !isNG) {
      walletApi.getBankList(country.code).then(r => {
        const networks = r.data.data ?? [];
        // Filter for mobile money type networks
        const momo = networks.filter((n: any) => n.type === "momo" || n.type === "mobile_money");
        setMomoProviders(momo.length > 0 ? momo : networks);
      }).catch(() => {});
    }
  }, [method, country.code, isNG]);

  // Auto-verify bank account when account number reaches expected length
  useEffect(() => {
    if (method === "bank_transfer" && bankName) {
      if (isNG && accountNumber.length === 10) {
        verifyAccount();
      } else if (!isNG && accountNumber.length >= 5) {
        verifyAccount();
      }
    }
  }, [accountNumber, bankName]);

  const verifyAccount = async () => {
    setVerifying(true);
    try {
      const selectedBank = banks.find(b => b.name === bankName);
      if (isNG) {
        const bankCode = selectedBank?.code ?? "044";
        const { data } = await walletApi.verifyBankAccount(accountNumber, bankCode, country.code);
        setVerifiedName(data.data.account_name);
      } else {
        const networkId = selectedBank?.network_id ?? selectedBank?.id;
        if (!networkId) { setVerifiedName(""); return; }
        const { data } = await walletApi.verifyBankAccount(accountNumber, "", country.code, networkId);
        setVerifiedName(data.data.account_name);
      }
    } catch {
      setVerifiedName("");
    } finally {
      setVerifying(false);
    }
  };

  const verifyMomo = async () => {
    if (!mobileNumber || !mobileProvider) return;
    setVerifying(true);
    try {
      const provider = momoProviders.find(p => p.id === mobileProvider || p.name === mobileProvider);
      const networkId = provider?.network_id ?? provider?.id;
      if (!networkId) { setVerifiedMomoName(""); setVerifying(false); return; }
      const { data } = await walletApi.verifyMomoAccount(mobileNumber, networkId);
      setVerifiedMomoName(data.data.account_name);
    } catch {
      setVerifiedMomoName("");
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: any = {
        country: country.code,
        currency: country.currency,
        first_name: firstName,
        last_name: lastName,
        payout_method: method,
      };

      if (method === "bank_transfer") {
        payload.bank_name = bankName;
        payload.account_number = accountNumber;
      } else if (method === "mobile_money") {
        payload.mobile_number = mobileNumber;
        payload.mobile_provider = mobileProvider;
      }

      const { data } = await transferApi.createRecipient(payload);
      setSavedRecipient(data.data);
      setStep("success");
    } catch (err: any) {
      alert(err.response?.data?.error ?? "Failed to save recipient");
    } finally {
      setLoading(false);
    }
  };

  // === SUCCESS SCREEN ===
  if (step === "success" && savedRecipient) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.successBg }]}>
            <Text style={[styles.successCheck, { color: colors.success }]}>✓</Text>
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Recipient Saved!</Text>
          <Text style={[styles.successSub, { color: colors.textSecondary }]}>
            {firstName} {lastName} has been added. You can now send money to them.
          </Text>

          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <ConfirmRow label="Name" value={`${firstName} ${lastName}`} colors={colors} />
            <ConfirmRow label="Bank" value={`${bankName} · ****${accountNumber.slice(-4)}`} colors={colors} />
            <ConfirmRow label="Country" value={`${country.name}`} colors={colors} last />
          </View>

          <Button title="Send Money Now" onPress={() => onSaved(savedRecipient)} />
          <Button title="Back to Recipients" onPress={onBack} variant="outline" style={{ marginTop: 10 }} />
        </View>
      </SafeAreaView>
    );
  }

  // === CONFIRM SCREEN ===
  if (step === "confirm") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={() => setStep("form")}><Text style={styles.back}>← Back</Text></TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Confirm recipient</Text>
          <Text style={[styles.pageSub, { color: colors.textMuted }]}>Please verify these details are correct</Text>

          <View style={[styles.avatarLarge, { backgroundColor: colors.accent }]}>
            <Text style={styles.avatarText}>{firstName[0]}{lastName[0]}</Text>
          </View>
          <Text style={[styles.heroName, { color: colors.text }]}>{firstName} {lastName}</Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]}>{country.name} {country.code === "NG" ? "🇳🇬" : country.code === "KE" ? "🇰🇪" : ""}</Text>

          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <ConfirmRow label="Payout method" value={METHODS.find(m => m.key === method)?.label ?? method} colors={colors} />
            {method === "bank_transfer" && (
              <>
                <ConfirmRow label="Bank" value={bankName} colors={colors} />
                <ConfirmRow label="Account number" value={accountNumber} colors={colors} />
                {verifiedName && <ConfirmRow label="Account name" value={verifiedName} colors={colors} highlight />}
              </>
            )}
            {method === "mobile_money" && (
              <>
                <ConfirmRow label="Provider" value={[...momoProviders, ...FALLBACK_PROVIDERS].find(p => (p.id ?? p.key) === mobileProvider)?.name ?? mobileProvider} colors={colors} />
                <ConfirmRow label="Mobile number" value={mobileNumber} colors={colors} />
                {verifiedMomoName && <ConfirmRow label="Account name" value={verifiedMomoName} colors={colors} highlight />}
              </>
            )}
            <ConfirmRow label="Currency" value={`${country.currency}`} colors={colors} last />
          </View>

          <Button title="Save Recipient" onPress={handleSave} loading={loading} />
          <Button title="Edit Details" onPress={() => setStep("form")} variant="outline" style={{ marginTop: 10 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // === FORM SCREEN ===
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={[styles.pageTitle, { color: colors.text }]}>New recipient</Text>
        <Text style={[styles.pageSub, { color: colors.textMuted }]}>Sending to {country.name}</Text>

        {/* Payout Method */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PAYOUT METHOD</Text>
        <View style={styles.methodRow}>
          {METHODS.map(m => (
            <TouchableOpacity
              key={m.key}
              style={[styles.methodBtn, { borderColor: method === m.key ? colors.accent : colors.cardBorder, backgroundColor: method === m.key ? (isDark ? "#312e81" : "#eef2ff") : colors.card }]}
              onPress={() => setMethod(m.key)}
            >
              <Text style={styles.methodIcon}>{m.icon}</Text>
              <Text style={[styles.methodLabel, { color: method === m.key ? colors.accent : colors.textSecondary }]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name */}
        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>First name</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          </View>
          <View style={styles.nameField}>
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Last name</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              value={lastName} onChangeText={setLastName} autoCapitalize="words" />
          </View>
        </View>

        {/* Bank Transfer Fields */}
        {method === "bank_transfer" && (
          <>
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Bank</Text>
            <TouchableOpacity style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, justifyContent: "center" }]}>
              <Text style={{ color: bankName ? colors.text : colors.textMuted, fontSize: 15 }}>
                {bankName || "Select a bank..."}
              </Text>
            </TouchableOpacity>
            {banks.length > 0 && !bankName && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bankChips}>
                {banks.slice(0, 10).map((b: any) => (
                  <TouchableOpacity key={b.code} style={[styles.bankChip, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={() => setBankName(b.name)}>
                    <Text style={[styles.bankChipText, { color: colors.text }]}>{b.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={[styles.formLabel, { color: colors.textSecondary, marginTop: 16 }]}>Account number</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" maxLength={10}
              placeholder="10-digit account number" placeholderTextColor={colors.textMuted} />

            {verifying && <ActivityIndicator color={colors.accent} style={{ marginTop: 8 }} />}
            {verifiedName ? (
              <View style={[styles.verifiedName, { backgroundColor: colors.successBg }]}>
                <Text style={[styles.verifiedCheck, { color: colors.success }]}>✓</Text>
                <Text style={[styles.verifiedText, { color: colors.success }]}>{verifiedName}</Text>
              </View>
            ) : null}
          </>
        )}

        {/* Mobile Money Fields */}
        {method === "mobile_money" && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 8 }]}>MOBILE MONEY PROVIDER</Text>
            <View style={styles.providerChips}>
              {(momoProviders.length > 0 ? momoProviders : FALLBACK_PROVIDERS).map((p: any) => {
                const pid = p.id ?? p.key;
                const pname = p.name;
                return (
                  <TouchableOpacity
                    key={pid}
                    style={[styles.providerChip, { borderColor: mobileProvider === pid ? colors.accent : colors.cardBorder, backgroundColor: mobileProvider === pid ? (isDark ? "#312e81" : "#eef2ff") : colors.card }]}
                    onPress={() => setMobileProvider(pid)}
                  >
                    <Text>📱</Text>
                    <Text style={[styles.providerText, { color: mobileProvider === pid ? colors.accent : colors.text }]}>{pname}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Mobile number</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad"
              placeholder="+254 7XX XXX XXX" placeholderTextColor={colors.textMuted} />

            {!isNG && mobileNumber.length >= 9 && !verifiedMomoName && !verifying && (
              <TouchableOpacity onPress={verifyMomo} style={[styles.verifyBtn, { backgroundColor: colors.accent }]}>
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Verify number</Text>
              </TouchableOpacity>
            )}
            {verifying && method === "mobile_money" && <ActivityIndicator color={colors.accent} style={{ marginTop: 8 }} />}
            {verifiedMomoName ? (
              <View style={[styles.verifiedName, { backgroundColor: colors.successBg }]}>
                <Text style={[styles.verifiedCheck, { color: colors.success }]}>✓</Text>
                <Text style={[styles.verifiedText, { color: colors.success }]}>{verifiedMomoName}</Text>
              </View>
            ) : null}
          </>
        )}

        <View style={{ height: 24 }} />
        <Button
          title="Continue"
          onPress={() => setStep("confirm")}
          disabled={!firstName || !lastName || (method === "bank_transfer" && !accountNumber) || (method === "mobile_money" && !mobileNumber)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ConfirmRow({ label, value, colors, last, highlight }: any) {
  return (
    <View style={[cStyles.row, !last && { borderBottomColor: colors.cardBorder, borderBottomWidth: 1 }]}>
      <Text style={[cStyles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[cStyles.value, { color: highlight ? colors.success : colors.text }, highlight && { fontWeight: "700" }]}>{value}</Text>
    </View>
  );
}

const cStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, fontSize: 14 },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: "600", maxWidth: "55%", textAlign: "right" },
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24 },
  back: { fontSize: 14, fontWeight: "600", color: "#4f46e5", marginBottom: 12 },
  pageTitle: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  pageSub: { fontSize: 13, marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 10 },
  methodRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  methodBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center", borderWidth: 1.5 },
  methodIcon: { fontSize: 22, marginBottom: 4 },
  methodLabel: { fontSize: 11, fontWeight: "600" },
  nameRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  nameField: { flex: 1 },
  formLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  bankChips: { flexDirection: "row", marginTop: 8, marginBottom: 8 },
  bankChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginRight: 8 },
  bankChipText: { fontSize: 13, fontWeight: "500" },
  verifiedName: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10, marginTop: 8 },
  verifiedCheck: { fontSize: 16, fontWeight: "700" },
  verifiedText: { fontSize: 13, fontWeight: "600" },
  providerChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  providerChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  providerText: { fontSize: 13, fontWeight: "600" },
  verifyBtn: { marginTop: 10, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignSelf: "flex-start" },
  confirmCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20 },
  avatarLarge: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  heroName: { textAlign: "center", fontSize: 18, fontWeight: "700", marginBottom: 4 },
  heroSub: { textAlign: "center", fontSize: 13, marginBottom: 20 },
  successContainer: { flex: 1, justifyContent: "center", padding: 24 },
  successIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 16 },
  successCheck: { fontSize: 28, fontWeight: "700" },
  successTitle: { textAlign: "center", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  successSub: { textAlign: "center", fontSize: 14, marginBottom: 32 },
});
