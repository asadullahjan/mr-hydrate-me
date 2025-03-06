import React, { useState, useEffect, createContext, useContext } from "react";
import { useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { Alert } from "react-native";
import * as Location from "expo-location";

// Define the User type
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
    location: Location.LocationObjectCoords;
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

// Define the AuthContext type
export type AuthContextType = {
  user: User;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
};

// Create the AuthContext with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
});

/**
 * AuthProvider manages user authentication state and redirects based on auth status and onboarding completion.
 * @param children - The child components to render within the provider
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State for user data, loading, and errors
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks for routing and segment tracking
  const router = useRouter();
  const rootSegment = useSegments()[0];

  /**
   * Fetches user data from Firestore and updates state, handling redirects as needed.
   * @param firebaseUser - The Firebase auth user object
   */
  const fetchUserData = async (firebaseUser: any) => {
    setIsLoading(true);
    try {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userDocData = userDoc.data();
        const onBoardingCompleted = userDoc.exists() ? userDocData?.onBoardingCompleted : false;

        const updatedUser: User = {
          uid: firebaseUser.uid,
          profile: {
            name: userDocData?.profile?.name || "",
            email: firebaseUser.email || "",
            weight: userDocData?.profile?.weight || 0,
            height: userDocData?.profile?.height || 0,
            age: userDocData?.profile?.age || 0,
            activity: userDocData?.profile?.activity || "",
            dailyGoal: userDocData?.profile?.dailyGoal || 0,
          },
          lastStreakUpdate: userDocData?.lastStreakUpdate?.toDate() || new Date(),
          currentStreak: userDocData?.currentStreak || 0,
          settings: userDocData?.settings || {
            location: {
              latitude: 0,
              longitude: 0,
              altitude: null,
              accuracy: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            notifications: {
              enabled: false,
              reminderFrequency: 0,
              startTime: 0,
              endTime: 0,
              soundEnabled: false,
            },
          },
          onBoardingCompleted,
        };

        setUser(updatedUser);

        // Redirect based on onboarding status
        if (!onBoardingCompleted && rootSegment !== "(onboarding)") {
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
    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : "An error occurred";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      await fetchUserData(firebaseUser);
    });
    return () => unsubscribe();
  }, []); // Empty dependency array since this runs once on mount

  /**
   * Refreshes user data from Firestore.
   */
  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    await fetchUserData(firebaseUser);
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider value={{ user, loading: isLoading, error, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the auth context.
 * @returns The current auth context value
 */
export function useAuth() {
  return useContext(AuthContext);
}
