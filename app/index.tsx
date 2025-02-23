import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator } from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Firestore imports
import { auth, db } from "@/firebaseConfig"; // Ensure db is imported from your firebaseConfig
import AuthForm from "./components/Auth/AuthForm";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { useNavigation } from "expo-router";

export default function Index() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser.uid);
        await checkOnboardingStatus(authUser.uid);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      console.log("auth state changed", !userDoc.exists() || userDoc.data()?.onBoarding !== true);

      if (!userDoc.exists() || userDoc.data()?.onBoarding !== true) {
        // Redirect to onboarding if missing or false
        navigation.navigate("pages/onBoarding" as never);
      }
    } catch (error) {
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const theme = {
    ...DefaultTheme,
    roundness: 1,
    colors: {
      ...DefaultTheme.colors,
      primary: "#47AEBE",
      accent: "#4CAF50",
      outline: "#47AEBE",
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#47AEBE"
        />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        {!user ? (
          <View style={styles.authContainer}>
            <AuthForm setUser={setUser} />
          </View>
        ) : (
          <View style={styles.loggedInContainer}>
            <Text style={styles.loggedInText}>Welcome!</Text>
            <Button
              title="Logout"
              onPress={logout}
              color="#D3D3D3"
            />
          </View>
        )}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "white",
  },
  authContainer: {
    flex: 1,
    padding: 8,
  },
  loggedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
  loggedInText: {
    fontSize: 24,
    color: "#333",
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
