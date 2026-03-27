import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, type ViewStyle } from "react-native";
import { colors } from "../utils/colors";

type Props = {
  readonly title: string;
  readonly onPress: () => void;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly variant?: "primary" | "outline";
  readonly style?: ViewStyle;
};

export default function Button({ title, onPress, loading, disabled, variant = "primary", style }: Props) {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.white : colors.accent} />
      ) : (
        <Text style={[styles.text, !isPrimary && styles.outlineText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 12, padding: 16, alignItems: "center" },
  primary: { backgroundColor: colors.accent },
  outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.accent },
  disabled: { opacity: 0.5 },
  text: { color: colors.white, fontSize: 16, fontWeight: "600" },
  outlineText: { color: colors.accent },
});
