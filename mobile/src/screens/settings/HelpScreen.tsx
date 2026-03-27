import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking } from "react-native";
import { useTheme } from "../../utils/theme";
import { Ionicons } from "@expo/vector-icons";

export default function HelpScreen({ navigation }: any) {
  const { colors } = useTheme();

  const items = [
    { icon: "chatbubble-ellipses", label: "Chat with Support", action: () => Linking.openURL("mailto:support@payvioapp.com") },
    { icon: "mail", label: "Email Us", action: () => Linking.openURL("mailto:support@payvioapp.com") },
    { icon: "call", label: "Call Us", action: () => Linking.openURL("tel:+12162472408") },
    { icon: "help-circle", label: "FAQs", action: () => Linking.openURL("https://payvioapp.com") },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Help & Support</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {items.map((item, i) => (
            <TouchableOpacity key={item.label} style={[styles.row, i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder }]} onPress={item.action}>
              <View style={styles.rowLeft}>
                <Ionicons name={item.icon as any} size={22} color={colors.accent} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
              </View>
              <Text style={{ color: colors.textMuted }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24 },
  back: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowLabel: { fontSize: 16 },
});
