import { useState, useRef } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { authApi } from "../../api";
import { useTheme } from "../../utils/theme";
import type { User } from "../../types";
import Button from "../../components/Button";

type Props = {
  readonly email: string;
  readonly onVerified: (tokens: { access_token: string; refresh_token: string }, user: User) => void;
};

export default function OtpVerifyScreen({ email, onVerified }: Props) {
  const { colors } = useTheme();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) handleVerify(fullOtp);
    }
  };

  const handleVerify = async (otpCode: string) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await authApi.verifyEmailOtp(email, otpCode);
      onVerified(data.data.tokens, data.data.user);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) setError("Invalid code. Please try again.");
      else if (status === 410) setError("Code expired. Please request a new one.");
      else setError("Verification failed. Try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.sendEmailOtp(email);
      setError("");
    } catch {
      setError("Failed to resend code.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        We sent a 6-digit code to{"\n"}
        <Text style={{ fontWeight: "700", color: colors.text }}>{email}</Text>
      </Text>

      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(ref) => { inputRefs.current[i] = ref; }}
            style={[styles.otpInput, { borderColor: digit ? colors.accent : colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text }]}
            value={digit}
            onChangeText={(v) => handleDigitChange(i, v)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
      {loading ? <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 24 }} /> : null}

      <Button title="Resend Code" onPress={handleResend} variant="outline" style={{ marginTop: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 32, lineHeight: 24 },
  otpRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 16 },
  otpInput: { width: 48, height: 56, borderWidth: 1.5, borderRadius: 12, fontSize: 24, fontWeight: "700", textAlign: "center" },
  error: { fontSize: 14, textAlign: "center", marginTop: 16 },
});
