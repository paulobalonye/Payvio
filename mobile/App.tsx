import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "./src/hooks/useAuth";
import AuthNavigator from "./src/navigation/AuthNavigator";
import MainNavigator from "./src/navigation/MainNavigator";
import LoadingScreen from "./src/components/LoadingScreen";

export default function App() {
  const { isLoading, isAuthenticated, login } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator onLogin={login} />}
    </NavigationContainer>
  );
}
