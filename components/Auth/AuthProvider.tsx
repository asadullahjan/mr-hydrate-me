import React, { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { Alert, Platform, ActivityIndicator, View, Text } from "react-native";
import * as Location from "expo-location";
import * as Network from "expo-network";
import { getApp } from "firebase/app";

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
 * AuthProvider manages user authentication state without handling redirects.
 * @param children - The child components to render within the provider
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State for user data, loading, and errors
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  /**
   * Fetches user data from Firestore and updates state.
   * @param firebaseUser - The Firebase auth user object
   */
  const fetchUserData = async (firebaseUser: any) => {
    if (!firebaseInitialized) {
      console.log("Firebase not fully initialized yet, waiting...");
      return;
    }

    setIsLoading(true);
    try {
      if (firebaseUser) {
        console.log("Fetching user data for:", firebaseUser.uid);
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
        console.log("User data set successfully");
      } else {
        console.log("No Firebase user found");
        setUser(null);
      }
    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : "An error occurred";
      console.error("Error fetching user data:", errorMessage);
      setError(errorMessage);
      if (!__DEV__) {
        Alert.alert("Error", errorMessage);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected) {
          throw new Error("No internet connection");
        }

        console.log("Network check passed, proceeding with Firebase initialization");

        const authReady = new Promise((resolve, reject) => {
          const checkAuth = () => {
            try {
              const currentUser = auth.currentUser;
              if (currentUser !== null || getApp().options.appId) {
                resolve(true);
              } else {
                setTimeout(checkAuth, 500);
              }
            } catch (e) {
              reject(e);
            }
          };
          checkAuth();
        });

        await Promise.race([
          authReady,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firebase initialization timed out")), 5000)
          ),
        ]);

        console.log("Firebase initialization complete");
        setFirebaseInitialized(true);
      } catch (e: any) {
        console.error("Firebase initialization error:", e.message);
        setError(e.message || "Failed to initialize Firebase");
      }
    };

    initializeFirebase();
  }, []);

  // Listen to auth state changes once Firebase is initialized
  useEffect(() => {
    if (!firebaseInitialized) return;

    console.log("Setting up auth state listener");
    let unsubscribe: any;

    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("Auth state changed:", firebaseUser ? "User logged in" : "No user");
        await fetchUserData(firebaseUser);
      });
    } catch (e) {
      console.error("Error setting up auth listener:", e);
      setError("Failed to setup authentication");
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [firebaseInitialized]);

  /**
   * Refreshes user data from Firestore.
   */
  const refreshUser = async () => {
    if (!firebaseInitialized) {
      console.log("Firebase not fully initialized yet, cannot refresh user");
      return;
    }

    setIsLoading(true);
    const firebaseUser = auth.currentUser;
    await fetchUserData(firebaseUser);
  };

  // Show loading or error UI
  if (isLoading || !firebaseInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#27ADC2"
        />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#333" }}>
          {isLoading ? "Loading your profile..." : "Initializing Firebase..."}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text>{error}</Text>
      </View>
    );
  }

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
