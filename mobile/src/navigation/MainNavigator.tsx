import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/home/HomeScreen";
import SendFlowScreen from "../screens/transfer/SendFlowScreen";
import TransactionHistoryScreen from "../screens/home/TransactionHistoryScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import TransferTrackingScreen from "../screens/transfer/TransferTrackingScreen";
import TransactionDetailScreen from "../screens/home/TransactionDetailScreen";
import AddMoneyScreen from "../screens/wallet/AddMoneyScreen";
import PaymentRequestScreen from "../screens/home/PaymentRequestScreen";
import ReferralScreen from "../screens/settings/ReferralScreen";
import { colors } from "../utils/colors";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.cardBorder, paddingTop: 4, height: 88 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="Send" component={SendFlowScreen} options={{ tabBarLabel: "Send" }} />
      <Tab.Screen name="History" component={TransactionHistoryScreen} options={{ tabBarLabel: "History" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: "Settings" }} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={HomeTabs} />
      <Stack.Screen name="TransferTracking" component={TransferTrackingScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="AddMoney" component={AddMoneyScreen} />
      <Stack.Screen name="PaymentRequest" component={PaymentRequestScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
    </Stack.Navigator>
  );
}
