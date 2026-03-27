import { useState } from "react";
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import Button from "../../components/Button";
import { api } from "../../api";
import { colors } from "../../utils/colors";

export default function ProfileSetupScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = firstName.trim() && lastName.trim() && email.includes("@");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.patch("/user/profile", {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
      });
      navigation.navigate("KycVerification");
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 409) {
        setError("This email is already registered.");
      } else if (status === 422) {
        setError("Please enter a valid email address.");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.progress}>
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      <Text style={styles.title}>Set up your profile</Text>
      <Text style={styles.subtitle}>We need a few details to get you started</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Next" onPress={handleSubmit} loading={loading} disabled={!isValid} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.bgPrimary, justifyContent: "center" },
  progress: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 32 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.cardBorder },
  progressActive: { backgroundColor: colors.accent, width: 24 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: "center", marginBottom: 32 },
  form: { gap: 16, marginBottom: 24 },
  input: { borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: colors.cardBg },
  error: { color: colors.error, fontSize: 14, textAlign: "center", marginBottom: 16 },
});
