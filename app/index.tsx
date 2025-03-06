import { useAuth } from "@/components/Auth/AuthProvider";
import { Redirect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return <ActivityIndicator style={{ margin: "auto" }} />;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user.onBoardingCompleted) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
