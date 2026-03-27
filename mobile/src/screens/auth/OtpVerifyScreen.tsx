import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { authApi } from "../../api";
import type { User } from "../../types";

type Props = {
  readonly phone: string;
  readonly countryCode: string;
  readonly onVerified: (tokens: { access_token: string; refresh_token: string }, user: User) => void;
};

export default function OtpVerifyScreen({ phone, countryCode, onVerified }: Props) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit on last digit
    if (value && index === 5) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleVerify = async (otpCode: string) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await authApi.verifyOtp(phone, countryCode, otpCode);
      onVerified(data.data.tokens, data.data.user);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) {
        setError("Invalid OTP. Please try again.");
      } else if (status === 410) {
        setError("OTP expired. Please request a new one.");
      } else {
        setError("Verification failed. Try again.");
      }
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter verification code</Text>
      <Text style={styles.subtitle}>Sent to {countryCode}{phone}</Text>

      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(ref) => { inputRefs.current[i] = ref; }}
            style={styles.otpInput}
            value={digit}
            onChangeText={(v) => handleDigitChange(i, v)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 24 }} /> : null}

      <TouchableOpacity style={styles.resendButton}>
        <Text style={styles.resendText}>Resend code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fafbff" },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#64748b", textAlign: "center", marginBottom: 32 },
  otpRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 16 },
  otpInput: { width: 48, height: 56, borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, fontSize: 24, fontWeight: "700", textAlign: "center", backgroundColor: "#fff" },
  error: { color: "#ef4444", fontSize: 14, textAlign: "center", marginTop: 16 },
  resendButton: { marginTop: 32, alignItems: "center" },
  resendText: { color: "#4f46e5", fontSize: 14, fontWeight: "600" },
});
