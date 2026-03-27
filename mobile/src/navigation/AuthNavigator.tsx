import { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PhoneEntryScreen from "../screens/auth/PhoneEntryScreen";
import OtpVerifyScreen from "../screens/auth/OtpVerifyScreen";
import ProfileSetupScreen from "../screens/auth/ProfileSetupScreen";
import type { User } from "../types";

const Stack = createNativeStackNavigator();

type Props = {
  readonly onLogin: (tokens: { access_token: string; refresh_token: string }, user: User) => void;
};

export default function AuthNavigator({ onLogin }: Props) {
  const [phoneData, setPhoneData] = useState<{ phone: string; countryCode: string } | null>(null);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PhoneEntry">
        {() => (
          <PhoneEntryScreen
            onOtpSent={(phone, countryCode) => setPhoneData({ phone, countryCode })}
          />
        )}
      </Stack.Screen>
      {phoneData && (
        <Stack.Screen name="OtpVerify">
          {() => (
            <OtpVerifyScreen
              phone={phoneData.phone}
              countryCode={phoneData.countryCode}
              onVerified={onLogin}
            />
          )}
        </Stack.Screen>
      )}
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}
