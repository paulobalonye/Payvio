import { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EmailEntryScreen from "../screens/auth/PhoneEntryScreen";
import OtpVerifyScreen from "../screens/auth/OtpVerifyScreen";
import ProfileSetupScreen from "../screens/auth/ProfileSetupScreen";
import type { User } from "../types";

const Stack = createNativeStackNavigator();

type Props = {
  readonly onLogin: (tokens: { access_token: string; refresh_token: string }, user: User) => void;
};

export default function AuthNavigator({ onLogin }: Props) {
  const [email, setEmail] = useState<string | null>(null);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmailEntry">
        {() => <EmailEntryScreen onOtpSent={(e) => setEmail(e)} />}
      </Stack.Screen>
      {email && (
        <Stack.Screen name="OtpVerify">
          {() => <OtpVerifyScreen email={email} onVerified={onLogin} />}
        </Stack.Screen>
      )}
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}
