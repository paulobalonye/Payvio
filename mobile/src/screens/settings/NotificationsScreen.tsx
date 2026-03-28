// TODO: Wire to /settings/notifications API when backend endpoint is ready
import { useState } from "react";
import { View, Text, Switch, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { useTheme } from "../../utils/theme";

export default function NotificationsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [transferAlerts, setTransferAlerts] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <NotifRow label="Push Notifications" value={pushEnabled} onToggle={setPushEnabled} colors={colors} />
          <NotifRow label="Email Notifications" value={emailEnabled} onToggle={setEmailEnabled} colors={colors} />
          <NotifRow label="Transfer Alerts" value={transferAlerts} onToggle={setTransferAlerts} colors={colors} />
          <NotifRow label="Promotions & Offers" value={promoAlerts} onToggle={setPromoAlerts} colors={colors} last />
        </View>
      </View>
    </SafeAreaView>
  );
}

function NotifRow({ label, value, onToggle, colors, last }: any) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder }]}>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ true: colors.accent }} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24 },
  back: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16 },
  rowLabel: { fontSize: 16 },
});
