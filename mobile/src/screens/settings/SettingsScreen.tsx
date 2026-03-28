import { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from "react-native";
import { api } from "../../api";
import StatusBadge from "../../components/StatusBadge";
import { useTheme } from "../../utils/theme";

export default function SettingsScreen({ navigation }: any) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try { const { data } = await api.get("/settings"); setUser(data.data); } catch { Alert.alert("Error", "Something went wrong. Please try again."); }
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { try { await api.delete("/settings/account"); } catch { alert("Failed"); } } },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {user && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Profile</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <SettingRow label="Name" value={`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Not set"} colors={colors} />
              <SettingRow label="Phone" value={user.phone ? `${user.country_code ?? ""}${user.phone}` : "Not set"} colors={colors} />
              <SettingRow label="Email" value={user.email ?? "Not set"} colors={colors} />
              <View style={[styles.row, { borderBottomColor: colors.cardBorder }]}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>KYC Status</Text>
                <StatusBadge status={user.kyc_status} />
              </View>
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity style={[styles.menuRow, { borderBottomColor: colors.cardBorder }]} onPress={toggleTheme}>
            <Text style={[styles.menuText, { color: colors.text }]}>{isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Account</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MenuRow label="Invite & Earn" onPress={() => navigation.navigate("Referral")} colors={colors} />
          <MenuRow label="Saved Cards" onPress={() => navigation.navigate("SavedCards")} colors={colors} />
          <MenuRow label="Linked Bank Accounts" onPress={() => navigation.navigate("LinkedBanks")} colors={colors} />
          <MenuRow label="Notification Preferences" onPress={() => navigation.navigate("Notifications")} colors={colors} />
          <MenuRow label="Help & Support" onPress={() => navigation.navigate("Help")} colors={colors} last />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Legal</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MenuRow label="Privacy Policy" onPress={() => navigation.navigate("PrivacyPolicy", { type: "privacy" })} colors={colors} />
          <MenuRow label="Terms of Service" onPress={() => navigation.navigate("TermsOfService", { type: "terms" })} colors={colors} last />
        </View>

        <TouchableOpacity style={[styles.deleteButton, { borderColor: colors.error }]} onPress={handleDeleteAccount}>
          <Text style={[styles.deleteText, { color: colors.error }]}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textMuted }]}>Payvio v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, value, colors }: any) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.cardBorder }]}>
      <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function MenuRow({ label, onPress, colors, last }: any) {
  return (
    <TouchableOpacity style={[styles.menuRow, !last && { borderBottomColor: colors.cardBorder, borderBottomWidth: 1 }]} onPress={onPress}>
      <Text style={[styles.menuText, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 24 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 15, fontWeight: "500" },
  menuRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16 },
  menuText: { fontSize: 16 },
  menuArrow: { fontSize: 20 },
  deleteButton: { marginTop: 32, paddingVertical: 14, alignItems: "center", borderRadius: 12, borderWidth: 1.5 },
  deleteText: { fontSize: 16, fontWeight: "600" },
  version: { fontSize: 12, textAlign: "center", marginTop: 24 },
});
