import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../../utils/theme";

export default function LegalScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { type } = route.params ?? { type: "privacy" };

  const isPrivacy = type === "privacy";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {isPrivacy ? "Privacy Policy" : "Terms of Service"}
        </Text>

        <Text style={[styles.date, { color: colors.textMuted }]}>Last updated: March 2026</Text>

        <Text style={[styles.body, { color: colors.textSecondary }]}>
          {isPrivacy ? `Payvio ("we", "us", "our") is committed to protecting your personal information and your right to privacy.

This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.

Information We Collect:
• Personal identification (name, email, phone number)
• Government-issued ID for KYC verification
• Financial information (bank account details, transaction history)
• Device information and usage data

How We Use Your Information:
• To facilitate money transfers and wallet services
• To verify your identity (KYC/AML compliance)
• To send transaction notifications
• To improve our services and user experience
• To comply with legal obligations

Data Security:
• 256-bit encryption for all data in transit and at rest
• Biometric authentication support
• Regular security audits
• SOC 2 Type II compliant infrastructure

Your Rights:
• Access your personal data
• Request data deletion
• Opt out of marketing communications
• Data portability

Contact: privacy@payvioapp.com` :

`These Terms of Service govern your use of Payvio and constitute a legally binding agreement.

By using Payvio, you agree to:
• Provide accurate personal information
• Complete identity verification (KYC)
• Not use the service for illegal activities
• Maintain the security of your account

Our Services:
• International money transfers to 40+ countries
• Multi-currency wallet
• Real-time exchange rates
• Payment requests

Transfer Limits:
• Minimum transfer: $10.00
• Maximum daily transfer: $2,500.00
• Limits may be increased after enhanced verification

Fees:
• Transfer fees starting from $1.99
• Exchange rates based on mid-market rates
• No hidden fees — all costs shown before confirmation

Liability:
• We are not liable for delays caused by third-party payment processors
• We reserve the right to suspend accounts suspected of fraud
• Disputes must be filed within 30 days of transaction

Governing Law:
These terms are governed by the laws of the United States.

Contact: legal@payvioapp.com`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24 },
  back: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  date: { fontSize: 13, marginBottom: 24 },
  body: { fontSize: 15, lineHeight: 24 },
});
