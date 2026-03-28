import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Linking } from "react-native";
import Button from "../../components/Button";
import { api } from "../../api";
import { colors } from "../../utils/colors";

export default function KycStatusScreen({ navigation }: any) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    pollStatus();
    intervalRef.current = setInterval(pollStatus, 30000); // poll every 30s
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const pollStatus = async () => {
    try {
      const { data } = await api.get("/user/profile");
      const kycStatus = data.data.kyc_status;
      if (kycStatus === "approved" || kycStatus === "rejected") {
        setStatus(kycStatus);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch {
      // silently retry on next poll
    }
  };

  if (status === "approved") {
    return (
      <View style={styles.container}>
        <View style={[styles.iconCircle, { backgroundColor: colors.successBg }]}>
          <Text style={styles.icon}>✓</Text>
        </View>
        <Text style={styles.title}>You're verified!</Text>
        <Text style={styles.subtitle}>Your identity has been confirmed. You can now send money to 40+ countries.</Text>
        <Button title="Start Sending" onPress={() => navigation.navigate("Main")} />
      </View>
    );
  }

  if (status === "rejected") {
    return (
      <View style={styles.container}>
        <View style={[styles.iconCircle, { backgroundColor: colors.errorBg }]}>
          <Text style={styles.icon}>✕</Text>
        </View>
        <Text style={styles.title}>Verification unsuccessful</Text>
        <Text style={styles.subtitle}>We couldn't verify your identity. Please try again with a clearer photo of your ID.</Text>
        <Button title="Try Again" onPress={() => navigation.goBack()} />
        <Button title="Contact Support" onPress={() => Linking.openURL("mailto:support@payvio.com")} variant="outline" style={{ marginTop: 12 }} />
      </View>
    );
  }

  // Pending state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} style={{ marginBottom: 24 }} />
      <Text style={styles.title}>Verifying your identity...</Text>
      <Text style={styles.subtitle}>This usually takes less than 5 minutes. We'll notify you when it's done.</Text>
      <Text style={styles.eta}>Checking every 30 seconds</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.bgPrimary, justifyContent: "center", alignItems: "center" },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  icon: { fontSize: 36, fontWeight: "700" },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: "center", marginBottom: 32, lineHeight: 24, maxWidth: 300 },
  eta: { fontSize: 14, color: colors.textMuted },
});
