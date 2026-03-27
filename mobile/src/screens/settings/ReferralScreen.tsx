import { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Share } from "react-native";
import { api } from "../../api";
import { formatCurrency } from "../../utils/format";
import { colors } from "../../utils/colors";

export default function ReferralScreen({ navigation }: any) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/referrals");
      setStats(data.data);
    } catch {
      // silently fail
    }
  };

  const handleShare = async () => {
    if (!stats) return;
    try {
      await Share.share({
        message: `Join Payvio and get $5! Use my code: ${stats.referral_code}\n${stats.referral_link}`,
      });
    } catch {
      // cancelled
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Invite & Earn</Text>
        <Text style={styles.subtitle}>Share your code. You both get $5 when they complete their first transfer.</Text>

        {stats && (
          <>
            {/* Referral Code Card */}
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>Your referral code</Text>
              <Text style={styles.code}>{stats.referral_code}</Text>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Text style={styles.shareText}>Share Code</Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.total_referrals}</Text>
                <Text style={styles.statLabel}>Invited</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.converted}</Text>
                <Text style={styles.statLabel}>Converted</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: colors.success }]}>
                  {formatCurrency(stats.total_earned)}
                </Text>
                <Text style={styles.statLabel}>Earned</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: { flex: 1, padding: 24 },
  back: { fontSize: 16, color: colors.accent, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 32, lineHeight: 24 },
  codeCard: { backgroundColor: colors.accent, borderRadius: 20, padding: 28, alignItems: "center", marginBottom: 32 },
  codeLabel: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 8 },
  code: { color: colors.white, fontSize: 32, fontWeight: "700", letterSpacing: 4, marginBottom: 16 },
  shareButton: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 9999 },
  shareText: { color: colors.white, fontSize: 14, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: { flex: 1, backgroundColor: colors.cardBg, borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 1, borderColor: colors.cardBorder },
  statNumber: { fontSize: 24, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.textMuted },
});
