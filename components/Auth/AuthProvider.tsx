// app/_layout.tsx
import { Stack } from "expo-router";
import { useRouter, useSegments } from "expo-router";
import React, { useEffect, createContext, useContext, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { ActivityIndicator, View } from "react-native";
import { DefaultTheme, PaperProvider } from "react-native-paper";

// Define types for our context
type User = {
  uid: string;
  onBoardingCompleted?: boolean;
  name: string;
  weight: number;
  height: number;
  age: number;
  activity: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  error: string | null;
};

// Create the context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rootSegment = useSegments()[0];
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Check onboarding status
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const onBoardingCompleted = userDoc.exists()
            ? userDoc.data()?.onBoardingCompleted
            : false;
          const data = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            onBoardingCompleted,
            name: data?.name,
            age: data?.age,
            weight: data?.weight,
            height: data?.height,
            activity: data?.activity,
          });

          // Handle navigation based on onboarding status
          if (!onBoardingCompleted) {
            router.replace("/(onboarding)/welcome");
          } else if (rootSegment !== "(tabs)") {
            router.replace("/(tabs)/home");
          }
        } else {
          setUser(null);
          if (rootSegment !== "(auth)") {
            router.replace("/(auth)/login");
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Protect routes based on auth state
  useEffect(() => {
    if (!loading && !user && rootSegment !== "(auth)") {
      router.replace("/(auth)/login");
    } else if (user && !user.onBoardingCompleted && rootSegment !== "(onboarding)") {
      router.replace("/(onboarding)/welcome");
    } else if (user && user.onBoardingCompleted && rootSegment === "(auth)") {
      router.replace("/(tabs)/home");
    }
  }, [user, loading, rootSegment]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color="#47AEBE"
        />
      </View>
    );
  }

  return <AuthContext.Provider value={{ user, loading, error }}>{children}</AuthContext.Provider>;
}

// Custom hook for using auth context
export function useAuth() {
  return useContext(AuthContext);
}
