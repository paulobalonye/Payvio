import { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import Button from "../../components/Button";
import { useTheme } from "../../utils/theme";

export default function LinkedBanksScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [banks] = useState<any[]>([]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Linked Bank Accounts</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Link your bank account for ACH transfers. Powered by Plaid.
        </Text>

        {banks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyIcon]}>🏦</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No bank accounts linked yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Link your bank to fund your wallet via ACH transfer</Text>
          </View>
        ) : null}

        <Button title="Link Bank Account" onPress={() => {
          // Plaid Link will be integrated here
          alert("Plaid integration coming soon. Use card funding for now.");
        }} />

        <Text style={[styles.note, { color: colors.textMuted }]}>
          Bank linking is powered by Plaid. Your credentials are never shared with Payvio.
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
  subtitle: { fontSize: 16, marginBottom: 32 },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  emptySubtext: { fontSize: 14, textAlign: "center" },
  note: { fontSize: 12, textAlign: "center", marginTop: 16 },
});
