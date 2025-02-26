import { useAuth } from "@/components/Auth/AuthProvider";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return null;
  console.log({ user });
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user.onBoardingCompleted) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
