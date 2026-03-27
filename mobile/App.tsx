import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "./src/hooks/useAuth";
import AuthNavigator from "./src/navigation/AuthNavigator";
import MainNavigator from "./src/navigation/MainNavigator";
import OnboardingScreen from "./src/screens/onboarding/OnboardingScreen";
import LoadingScreen from "./src/components/LoadingScreen";
import { ThemeProvider, useTheme } from "./src/utils/theme";

function AppContent() {
  const { isLoading, isAuthenticated, login } = useAuth();
  const { colors } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync("onboarding_done").then((val) => {
      setShowOnboarding(val !== "true");
    });
  }, []);

  if (isLoading || showOnboarding === null) {
    return <LoadingScreen />;
  }

  if (showOnboarding) {
    return (
      <>
        <StatusBar style={colors.statusBarStyle as any} />
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={colors.statusBarStyle as any} />
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator onLogin={login} />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
