// import { auth } from "@/firebaseConfig";
// import { Redirect, SplashScreen } from "expo-router";
// import { onAuthStateChanged } from "firebase/auth";
// import { useState, useEffect } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, View, Text } from "react-native";

// SplashScreen.preventAutoHideAsync().catch(console.warn);

export default function Index() {
  // const [appIsReady, setAppIsReady] = useState(false);
  // console.warn("root layout ran");
  // useEffect(() => {
  //   async function prepare() {
  //     try {
  //       // Wait for Firebase auth state to be determined
  //       await new Promise((resolve) => {
  //         const unsubscribe = onAuthStateChanged(auth, (user) => {
  //           console.log("Auth state changed:", user ? "Logged in" : "Logged out");
  //           unsubscribe(); // Clean up listener
  //           resolve(user); // Resolve when auth state is determined
  //         });
  //       });
  //       // Simulate additional loading (e.g., font loading, data fetch)
  //       await new Promise((resolve) => setTimeout(resolve, 1000));
  //     } catch (e) {
  //       console.error("Initialization error:", e);
  //     } finally {
  //       setAppIsReady(true);
  //     }
  //   }

  //   prepare();
  // }, []);

  // useEffect(() => {
  //   if (appIsReady) {
  //     SplashScreen.hideAsync().catch(console.error);
  //   }
  // }, [appIsReady]);

  // if (!appIsReady) {
  //   return null; // Render nothing until initialization is complete
  // }

  // useEffect(() => {
  //   // Hide splash screen after component mounts
  //   SplashScreen.hideAsync().catch(console.warn);
  // }, []);

  // const { user, loading: isAuthLoading } = useAuth();

  // if (isAuthLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator
  //         size="large"
  //         color="#27ADC2"
  //       />
  //       <Text style={styles.loadingText}>Loading your profile...</Text>
  //     </View>
  //   );
  // }

  // if (!user) {
  //   return <Redirect href="/(auth)/login" />;
  // }

  // if (!user.onBoardingCompleted) {
  //   return <Redirect href="/(onboarding)/welcome" />;
  // }

  // return <Redirect href="/(tabs)/home" />;
  return (
    <SafeAreaView
      style={{ justifyContent: "center", alignItems: "center", flex: 1, backgroundColor: "black" }}
    >
      <Text>Hi this is me talking</Text>;
      <Text>{process?.env?.EXPO_PUBLIC_FIREBASE_API_KEY || "Not found"}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#333",
  },
});
