import { useAuth } from "@/components/Auth/AuthProvider";
import { Redirect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { StyleSheet } from "react-native";

/**
 * Index component serves as the entry point for the app, redirecting users based on
 * their authentication and onboarding status.
 */
export default function Index() {
  // Hooks for authentication state
  const { user, loading: isAuthLoading } = useAuth();

  // Show loading indicator while auth state is being determined
  if (isAuthLoading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect to onboarding if not completed
  if (!user.onBoardingCompleted) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // Redirect to home screen if authenticated and onboarding is complete
  return <Redirect href="/(tabs)/home" />;
}

// Styles for the Index component
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
