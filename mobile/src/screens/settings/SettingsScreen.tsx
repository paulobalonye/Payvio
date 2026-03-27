import { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from "react-native";
import { api } from "../../api";
import { colors } from "../../utils/colors";
import StatusBadge from "../../components/StatusBadge";

export default function SettingsScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/settings");
      setUser(data.data);
    } catch {
      // silently fail
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be anonymized.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete("/settings/account");
              // Trigger logout
            } catch {
              alert("Failed to delete account");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>

        {user && (
          <>
            {/* Profile Section */}
            <Text style={styles.sectionTitle}>Profile</Text>
            <View style={styles.card}>
              <SettingRow label="Name" value={`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Not set"} />
              <SettingRow label="Phone" value={`${user.country_code}${user.phone}`} />
              <SettingRow label="Email" value={user.email ?? "Not set"} />
              <View style={styles.row}>
                <Text style={styles.rowLabel}>KYC Status</Text>
                <StatusBadge status={user.kyc_status} />
              </View>
            </View>

            {/* Actions */}
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate("Referral")}>
                <Text style={styles.menuText}>Invite & Earn</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuRow}>
                <Text style={styles.menuText}>Linked Bank Accounts</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuRow}>
                <Text style={styles.menuText}>Notification Preferences</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuRow}>
                <Text style={styles.menuText}>Help & Support</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Legal */}
            <Text style={styles.sectionTitle}>Legal</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.menuRow}>
                <Text style={styles.menuText}>Privacy Policy</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuRow}>
                <Text style={styles.menuText}>Terms of Service</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuRow}>
                <Text style={styles.menuText}>Licenses</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Danger Zone */}
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Payvio v1.0.0</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: { padding: 24 },
  title: { fontSize: 28, fontWeight: "700", color: colors.textPrimary, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 24 },
  card: { backgroundColor: colors.cardBg, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  rowLabel: { fontSize: 15, color: colors.textSecondary },
  rowValue: { fontSize: 15, fontWeight: "500", color: colors.textPrimary },
  menuRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  menuText: { fontSize: 16, color: colors.textPrimary },
  menuArrow: { fontSize: 20, color: colors.textMuted },
  deleteButton: { marginTop: 32, paddingVertical: 14, alignItems: "center", borderRadius: 12, borderWidth: 1.5, borderColor: colors.error },
  deleteText: { fontSize: 16, fontWeight: "600", color: colors.error },
  version: { fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 24 },
});
