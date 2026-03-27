import { useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../../utils/theme";

const { width } = Dimensions.get("window");

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  illustrationColor: string[];
  illustrationColorDark: string[];
  floatingCards?: { flag: string; text: string; position: string }[];
  globeColor?: string;
  rateCard?: boolean;
  shieldIcon?: boolean;
};

const SLIDES: Slide[] = [
  {
    id: "1",
    title: "Send Money Home,\nInstantly",
    subtitle: "Transfer money to your loved ones in 40+ countries. They receive it in minutes, not days.",
    illustrationColor: ["#eef2ff", "#e0e7ff"],
    illustrationColorDark: ["#1e1b4b", "#312e81"],
    floatingCards: [
      { flag: "🇳🇬", text: "₦780K", position: "topRight" },
      { flag: "🇺🇸", text: "$500", position: "bottomLeft" },
      { flag: "🇰🇪", text: "KES 76K", position: "midLeft" },
    ],
    globeColor: "#4f46e5",
  },
  {
    id: "2",
    title: "Real Rates,\nTiny Fees",
    subtitle: "We use the mid-market rate — the same one you see on Google. Fees from just $1.99.",
    illustrationColor: ["#ecfdf5", "#d1fae5"],
    illustrationColorDark: ["#064e3b", "#065f46"],
    rateCard: true,
  },
  {
    id: "3",
    title: "Fast, Secure,\nAlways Protected",
    subtitle: "Bank-level encryption, biometric login, and real-time fraud monitoring. Your money is safe.",
    illustrationColor: ["#faf5ff", "#f3e8ff"],
    illustrationColorDark: ["#2e1065", "#3b0764"],
    shieldIcon: true,
  },
];

type Props = {
  readonly onComplete: () => void;
};

export default function OnboardingScreen({ onComplete }: Props) {
  const { colors, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await SecureStore.setItemAsync("onboarding_done", "true");
    onComplete();
  };

  const renderSlide = ({ item }: { item: Slide }) => {
    const bgColors = isDark ? item.illustrationColorDark : item.illustrationColor;

    return (
      <View style={[styles.slide, { width }]}>
        {/* Illustration */}
        <View style={styles.illustrationArea}>
          <View style={[styles.circle, { backgroundColor: bgColors[0] }]}>
            {item.globeColor && (
              <>
                <View style={[styles.globe, { backgroundColor: item.globeColor }]}>
                  <View style={styles.globeLine1} />
                  <View style={styles.globeLine2} />
                  <View style={styles.globeShine} />
                </View>
                {item.floatingCards?.map((card, i) => (
                  <View
                    key={i}
                    style={[
                      styles.floatingCard,
                      { backgroundColor: isDark ? colors.card : "#fff" },
                      card.position === "topRight" && styles.fcTopRight,
                      card.position === "bottomLeft" && styles.fcBottomLeft,
                      card.position === "midLeft" && styles.fcMidLeft,
                    ]}
                  >
                    <Text style={styles.fcFlag}>{card.flag}</Text>
                    <Text style={[styles.fcText, { color: colors.text }]}>{card.text}</Text>
                  </View>
                ))}
              </>
            )}
            {item.rateCard && (
              <View style={[styles.rateCardMain, { backgroundColor: isDark ? colors.card : "#fff" }]}>
                <Text style={[styles.rateLabel, { color: colors.textMuted }]}>You send</Text>
                <Text style={[styles.rateBig, { color: colors.text }]}>$500.00</Text>
                <View style={[styles.rateDivider, { backgroundColor: colors.cardBorder }]} />
                <View style={styles.rateRow}><Text style={[styles.rateRowL, { color: colors.textMuted }]}>Rate</Text><Text style={[styles.rateRowV, { color: colors.success }]}>1,560 NGN</Text></View>
                <View style={styles.rateRow}><Text style={[styles.rateRowL, { color: colors.textMuted }]}>Fee</Text><Text style={[styles.rateRowV, { color: colors.text }]}>$2.99</Text></View>
                <View style={styles.rateRow}><Text style={[styles.rateRowL, { color: colors.textMuted }]}>They get</Text><Text style={[styles.rateRowV, { color: colors.success }]}>₦780,000</Text></View>
                <View style={styles.savingsBadge}><Text style={styles.savingsText}>Save 5x vs banks ✨</Text></View>
              </View>
            )}
            {item.shieldIcon && (
              <>
                <View style={styles.shield}>
                  <Text style={styles.shieldCheck}>✓</Text>
                </View>
                <View style={[styles.floatingCard, styles.fcTopRight, { backgroundColor: isDark ? colors.card : "#fff" }]}>
                  <Text style={[styles.fcText, { color: colors.text }]}>⚡ 3 min delivery</Text>
                </View>
                <View style={[styles.floatingCard, styles.fcBottomLeft, { backgroundColor: isDark ? colors.card : "#fff" }]}>
                  <Text style={[styles.fcText, { color: colors.text }]}>🔒 256-bit encrypted</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === currentIndex ? colors.accent : colors.cardBorder },
              i === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.accent }]} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>

        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleComplete}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1, paddingHorizontal: 24 },
  illustrationArea: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60 },
  circle: { width: 260, height: 260, borderRadius: 130, justifyContent: "center", alignItems: "center", position: "relative" },
  globe: { width: 120, height: 120, borderRadius: 60, overflow: "hidden" },
  globeLine1: { position: "absolute", width: 120, height: 60, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 60, top: 30 },
  globeLine2: { position: "absolute", width: 60, height: 120, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 60, left: 30 },
  globeShine: { position: "absolute", top: 20, left: 25, width: 35, height: 25, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, transform: [{ rotate: "-15deg" }] },
  floatingCard: { position: "absolute", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  fcTopRight: { top: 15, right: -15 },
  fcBottomLeft: { bottom: 25, left: -15 },
  fcMidLeft: { top: 70, left: -20 },
  fcFlag: { fontSize: 18 },
  fcText: { fontSize: 13, fontWeight: "700" },
  rateCardMain: { borderRadius: 16, padding: 20, width: 190, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  rateLabel: { fontSize: 11, textAlign: "center" },
  rateBig: { fontSize: 24, fontWeight: "800", textAlign: "center", marginVertical: 6 },
  rateDivider: { height: 1, marginVertical: 10 },
  rateRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  rateRowL: { fontSize: 12 },
  rateRowV: { fontSize: 13, fontWeight: "700" },
  savingsBadge: { position: "absolute", bottom: -12, right: -10, backgroundColor: "#059669", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, shadowColor: "#059669", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8 },
  savingsText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  shield: { width: 100, height: 120, backgroundColor: "#7c3aed", justifyContent: "center", alignItems: "center", borderRadius: 12, transform: [{ rotate: "0deg" }], shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  shieldCheck: { fontSize: 42, color: "#fff", fontWeight: "700", marginTop: -5 },
  content: { paddingBottom: 20, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", lineHeight: 34, marginBottom: 12 },
  subtitle: { fontSize: 15, textAlign: "center", lineHeight: 24, maxWidth: 300 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 20 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 20 },
  buttons: { paddingHorizontal: 24, paddingBottom: 40, gap: 12, alignItems: "center" },
  nextBtn: { width: "100%", paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  nextBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  skipText: { fontSize: 14, fontWeight: "500" },
});
