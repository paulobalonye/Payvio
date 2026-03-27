import { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { colors } from "../../../utils/colors";

const COUNTRIES = [
  { code: "NG", name: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", currency: "GHS", flag: "🇬🇭" },
  { code: "KE", name: "Kenya", currency: "KES", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { code: "UG", name: "Uganda", currency: "UGX", flag: "🇺🇬" },
  { code: "TZ", name: "Tanzania", currency: "TZS", flag: "🇹🇿" },
  { code: "ET", name: "Ethiopia", currency: "ETB", flag: "🇪🇹" },
  { code: "SN", name: "Senegal", currency: "XOF", flag: "🇸🇳" },
  { code: "IN", name: "India", currency: "INR", flag: "🇮🇳" },
  { code: "PH", name: "Philippines", currency: "PHP", flag: "🇵🇭" },
  { code: "PK", name: "Pakistan", currency: "PKR", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", currency: "BDT", flag: "🇧🇩" },
  { code: "MX", name: "Mexico", currency: "MXN", flag: "🇲🇽" },
  { code: "CO", name: "Colombia", currency: "COP", flag: "🇨🇴" },
  { code: "BR", name: "Brazil", currency: "BRL", flag: "🇧🇷" },
];

type Props = {
  readonly onSelect: (country: { code: string; name: string; currency: string }) => void;
  readonly onBack: () => void;
};

export default function CountrySelectStep({ onSelect, onBack }: Props) {
  const [search, setSearch] = useState("");

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Send money to</Text>
      </View>

      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search countries..."
        autoFocus
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => onSelect(item)}>
            <Text style={styles.flag}>{item.flag}</Text>
            <View style={styles.rowText}>
              <Text style={styles.countryName}>{item.name}</Text>
              <Text style={styles.currencyCode}>{item.currency}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: { padding: 24, paddingBottom: 8 },
  back: { fontSize: 16, color: colors.accent, fontWeight: "600", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", color: colors.textPrimary },
  search: { marginHorizontal: 24, marginVertical: 16, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: colors.cardBg },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  flag: { fontSize: 28, marginRight: 16 },
  rowText: { flex: 1 },
  countryName: { fontSize: 16, fontWeight: "600", color: colors.textPrimary },
  currencyCode: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  arrow: { fontSize: 24, color: colors.textMuted },
});
