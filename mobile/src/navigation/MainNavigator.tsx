import { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import HomeScreen from "../screens/home/HomeScreen";
import SendFlowScreen from "../screens/transfer/SendFlowScreen";
import TransactionHistoryScreen from "../screens/home/TransactionHistoryScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import TransferTrackingScreen from "../screens/transfer/TransferTrackingScreen";
import TransactionDetailScreen from "../screens/home/TransactionDetailScreen";
import AddMoneyScreen from "../screens/wallet/AddMoneyScreen";
import PaymentRequestScreen from "../screens/home/PaymentRequestScreen";
import ReferralScreen from "../screens/settings/ReferralScreen";
import NotificationsScreen from "../screens/settings/NotificationsScreen";
import HelpScreen from "../screens/settings/HelpScreen";
import LegalScreen from "../screens/settings/LegalScreen";
import LinkedBanksScreen from "../screens/settings/LinkedBanksScreen";
import KycScreen from "../screens/auth/KycScreen";
import KycStatusScreen from "../screens/auth/KycStatusScreen";
import { useTheme } from "../utils/theme";
import { api } from "../api";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Empty placeholder — KYC gating now handled in HomeScreen directly

function HomeTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          paddingTop: 4,
          height: 88,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" as const },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: "home",
            Send: "arrow-up-circle",
            History: "time",
            Settings: "settings",
          };
          return <Ionicons name={icons[route.name] ?? "ellipse"} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Send" component={SendFlowScreen} />
      <Tab.Screen name="History" component={TransactionHistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={HomeTabs} />
      {/* KYC gate screens removed — gating done in HomeScreen */}
      <Stack.Screen name="SendFlow" component={SendFlowScreen} />
      <Stack.Screen name="TransferTracking" component={TransferTrackingScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="AddMoney" component={AddMoneyScreen} />
      <Stack.Screen name="AddMoneyDirect" component={AddMoneyScreen} />
      <Stack.Screen name="PaymentRequest" component={PaymentRequestScreen} />
      <Stack.Screen name="PaymentRequestDirect" component={PaymentRequestScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="PrivacyPolicy" component={LegalScreen} />
      <Stack.Screen name="TermsOfService" component={LegalScreen} />
      <Stack.Screen name="LinkedBanks" component={LinkedBanksScreen} />
      <Stack.Screen name="KycVerification" component={KycScreen} />
      <Stack.Screen name="KycStatus" component={KycStatusScreen} />
    </Stack.Navigator>
  );
}
