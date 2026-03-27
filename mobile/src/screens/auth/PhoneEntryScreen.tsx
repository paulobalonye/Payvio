import { useState } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { authApi } from "../../api";
import { useTheme } from "../../utils/theme";
import Button from "../../components/Button";

type Props = {
  readonly onOtpSent: (email: string) => void;
};

export default function EmailEntryScreen({ onOtpSent }: Props) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = email.includes("@") && email.includes(".");

  const handleSendOtp = async () => {
    if (!isValidEmail) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authApi.sendEmailOtp(email.trim().toLowerCase());
      onOtpSent(email.trim().toLowerCase());
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to send code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.bg }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Text style={[styles.logo, { color: colors.accent }]}>Payvio</Text>
      <Text style={[styles.title, { color: colors.text }]}>Enter your email</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>We'll send you a verification code</Text>

      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor={colors.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
      />

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

      <Button
        title="Send Code"
        onPress={handleSendOtp}
        loading={loading}
        disabled={!isValidEmail || loading}
      />

      <Text style={[styles.note, { color: colors.textMuted }]}>
        We'll email you a 6-digit code to verify your account
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  logo: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 32 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 32 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  error: { fontSize: 14, textAlign: "center", marginBottom: 16 },
  note: { fontSize: 13, textAlign: "center", marginTop: 16 },
});
