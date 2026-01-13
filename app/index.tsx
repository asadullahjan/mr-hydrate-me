import { useAuth } from "@/components/auth/AuthProvider";
import { Redirect } from "expo-router";
import { ActivityIndicator, SafeAreaView, StyleSheet, View, Text } from "react-native";

export default function Index() {
  const { user, loading: isAuthLoading } = useAuth();

  // useEffect(() => {
  //   async function prepare() {
  //     try {
  //       // Wait for Firebase auth state
  //       await new Promise((resolve) => {
  //         const unsubscribe = onAuthStateChanged(auth, (user) => {
  //           unsubscribe();
  //           resolve(user);
  //         });
  //       });

  //     } catch (e) {
  //       console.error("Index: Initialization error:", e);
  //     } finally {
  //       setAppIsReady(true);
  //       await SplashScreen.hideAsync().catch(console.error);
  //     }
  //   }

  //   prepare();
  // }, []);

  if (isAuthLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#27ADC2"
        />
      </SafeAreaView>
    );
  }

  if (!user) {
    return <Redirect href={"/(auth)/login"} />;
  }

  if (!user.onBoardingCompleted) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
