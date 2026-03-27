import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";
import { api } from "../../api";
import { colors } from "../../utils/colors";

export default function KycScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartKyc = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/kyc/session");
      const sessionUrl = data.data.session_url;
      // In production: open Veriff SDK with sessionUrl
      // For now, navigate to status screen
      navigation.navigate("KycStatus");
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError("You're already verified!");
        navigation.navigate("Main");
      } else {
        setError("Failed to start verification. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressActive]} />
        <View style={styles.progressDot} />
      </View>

      <View style={styles.iconCircle}>
        <Text style={styles.icon}>🪪</Text>
      </View>

      <Text style={styles.title}>Verify your identity</Text>
      <Text style={styles.subtitle}>
        We need to verify your identity before you can send money. This takes about 2 minutes.
      </Text>

      <View style={styles.docTypes}>
        {["Passport", "Driver's License", "National ID"].map((doc) => (
          <View key={doc} style={styles.docRow}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.docText}>{doc}</Text>
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Start Verification" onPress={handleStartKyc} loading={loading} />
      <Button title="Skip for now" onPress={() => navigation.navigate("Main")} variant="outline" style={{ marginTop: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.bgPrimary, justifyContent: "center" },
  progress: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 32 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.cardBorder },
  progressActive: { backgroundColor: colors.accent, width: 24 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accentLight, justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 24 },
  icon: { fontSize: 36 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: "center", marginBottom: 32, lineHeight: 24 },
  docTypes: { gap: 12, marginBottom: 32 },
  docRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16 },
  checkmark: { color: colors.success, fontSize: 16, fontWeight: "700" },
  docText: { fontSize: 16, color: colors.textPrimary },
  error: { color: colors.error, fontSize: 14, textAlign: "center", marginBottom: 16 },
});
