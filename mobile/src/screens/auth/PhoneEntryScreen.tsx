import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { authApi } from "../../api";

type Props = {
  readonly onOtpSent: (phone: string, countryCode: string) => void;
};

export default function PhoneEntryScreen({ onOtpSent }: Props) {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    if (phone.length < 7) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authApi.sendOtp(phone, countryCode);
      onOtpSent(phone, countryCode);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Payvio</Text>
      <Text style={styles.title}>Enter your phone number</Text>
      <Text style={styles.subtitle}>We'll send you a verification code</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.countryCode}
          value={countryCode}
          onChangeText={setCountryCode}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.phoneInput}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          keyboardType="phone-pad"
          autoFocus
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, (!phone || loading) && styles.buttonDisabled]}
        onPress={handleSendOtp}
        disabled={!phone || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fafbff" },
  logo: { fontSize: 28, fontWeight: "700", color: "#4f46e5", textAlign: "center", marginBottom: 32 },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#64748b", textAlign: "center", marginBottom: 32 },
  inputRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  countryCode: { width: 70, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 16, fontSize: 16, textAlign: "center", backgroundColor: "#fff" },
  phoneInput: { flex: 1, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: "#fff" },
  error: { color: "#ef4444", fontSize: 14, textAlign: "center", marginBottom: 16 },
  button: { backgroundColor: "#4f46e5", borderRadius: 12, padding: 16, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
