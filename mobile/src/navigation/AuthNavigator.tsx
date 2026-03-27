import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EmailEntryScreen from "../screens/auth/PhoneEntryScreen";
import OtpVerifyScreen from "../screens/auth/OtpVerifyScreen";
import ProfileSetupScreen from "../screens/auth/ProfileSetupScreen";
import type { User } from "../types";

type AuthStackParamList = {
  EmailEntry: undefined;
  OtpVerify: { email: string };
  ProfileSetup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

type Props = {
  readonly onLogin: (tokens: { access_token: string; refresh_token: string }, user: User) => void;
};

export default function AuthNavigator({ onLogin }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmailEntry">
        {({ navigation }) => (
          <EmailEntryScreen
            onOtpSent={(email) => navigation.navigate("OtpVerify", { email })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="OtpVerify">
        {({ route }) => (
          <OtpVerifyScreen
            email={route.params.email}
            onVerified={onLogin}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}
