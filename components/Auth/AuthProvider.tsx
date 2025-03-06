import { Stack } from "expo-router";
import { useRouter, useSegments } from "expo-router";
import React, { useEffect, createContext, useContext, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { ActivityIndicator, Alert, View } from "react-native";
import { DefaultTheme, PaperProvider } from "react-native-paper";

// Define types for our context
export type User = {
  uid: string;
  profile: {
    name: string;
    email: string;
    weight: number;
    height: number;
    age: number;
    activity: string;
    dailyGoal: number;
  };
  lastStreakUpdate: Date;
  currentStreak: number;
  settings: {
    location: string;
    notifications: {
      enabled: boolean;
      reminderFrequency: number;
      startTime: number;
      endTime: number;
      soundEnabled: boolean;
    };
  };
  onBoardingCompleted?: boolean;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>; // Ensure refreshUser is included
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {}, // Default implementation
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rootSegment = useSegments()[0];
  const router = useRouter();

  const fetchUserData = async (firebaseUser: any) => {
    setLoading(true);
    try {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userDocData = userDoc.data();
        const onBoardingCompleted = userDoc.exists() ? userDocData?.onBoardingCompleted : false;

        const updatedUser = {
          uid: firebaseUser.uid,
          ...userDocData,
          profile: {
            ...userDocData?.profile,
            email: firebaseUser.email,
          },
          settings: userDocData?.settings,
        } as User;

        setLoading(false);
        setUser(updatedUser);

        if (!onBoardingCompleted) {
          router.navigate("/(onboarding)/welcome");
        } else if (rootSegment !== "(tabs)") {
          router.navigate("/(tabs)/home");
        }
      } else {
        setUser(null);
        if (rootSegment !== "(auth)") {
          router.navigate("/(auth)/login");
        }
      }
    } catch (e: any) {
      setError(e instanceof Error ? e.message : "An error occurred");
      Alert.alert("Error", e.message || "An error occurred");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      await fetchUserData(firebaseUser);
    });
    return unsubscribe;
  }, []);

  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    await fetchUserData(firebaseUser);
  };

  useEffect(() => {
    if (!loading) {
      if (!user && rootSegment !== "(auth)") {
        router.navigate("/(auth)/login");
      } else if (user && !user.onBoardingCompleted && rootSegment !== "(onboarding)") {
        router.navigate("/(onboarding)/welcome");
      } else if (user && user.onBoardingCompleted && rootSegment !== "(tabs)") {
        router.navigate("/(tabs)/home");
      }
    }
  }, [user, loading, rootSegment]);

  return (
    <AuthContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
