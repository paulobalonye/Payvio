import { useState } from "react";
import { View, Text, StyleSheet, Linking } from "react-native";
import Button from "../../components/Button";
import { api } from "../../api";
import { useTheme } from "../../utils/theme";

export default function KycScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartKyc = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/kyc/session");
      const sessionUrl = data.data.session_url;

      if (sessionUrl) {
        // Open Veriff verification in browser
        // Veriff handles document scanning + face recognition
        await Linking.openURL(sessionUrl);
        // After user completes, navigate to status screen
        navigation.navigate("KycStatus");
      } else {
        setError("Could not start verification. Try again.");
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        // Already verified
        navigation.navigate("Main");
      } else {
        setError(err.response?.data?.error ?? "Failed to start verification. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
        <Text style={styles.icon}>🪪</Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Verify your identity</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        To send money, we need to verify your identity. This takes about 2 minutes.
      </Text>

      <View style={styles.steps}>
        <StepItem icon="📄" text="Scan your ID (passport, driver's license, or national ID)" colors={colors} />
        <StepItem icon="🤳" text="Take a selfie for facial recognition" colors={colors} />
        <StepItem icon="✅" text="Get verified instantly" colors={colors} />
      </View>

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

      <View style={{ flex: 1 }} />

      <Button title="Start Verification" onPress={handleStartKyc} loading={loading} />
      <Button title="Skip for now" onPress={() => navigation.goBack()} variant="outline" style={{ marginTop: 12 }} />
    </View>
  );
}

function StepItem({ icon, text, colors }: { icon: string; text: string; colors: any }) {
  return (
    <View style={stepStyles.row}>
      <Text style={stepStyles.icon}>{icon}</Text>
      <Text style={[stepStyles.text, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  icon: { fontSize: 24 },
  text: { fontSize: 15, flex: 1, lineHeight: 22 },
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 24 },
  icon: { fontSize: 36 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 32, lineHeight: 24 },
  steps: { gap: 4, marginBottom: 32 },
  error: { fontSize: 14, textAlign: "center", marginBottom: 16 },
});
