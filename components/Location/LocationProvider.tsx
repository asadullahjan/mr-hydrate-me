import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "../Auth/AuthProvider";

// Define the LocationState interface
interface LocationState {
  locationPermission: string | null;
  location: Location.LocationObjectCoords | null;
  error: string | null;
  requestPermission: () => Promise<void>;
  setLocation: (location: Location.LocationObjectCoords | null) => void;
}

// Create the LocationContext
const LocationContext = createContext<LocationState | undefined>(undefined);

/**
 * LocationProvider manages location permissions and data, syncing with Firestore.
 * @param children - The child components to render within the provider
 */
export function LocationProvider({ children }: { children: ReactNode }) {
  // State for location data and permissions
  const [locationPermission, setLocationPermission] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hook for auth user data
  const { user } = useAuth();

  /**
   * Requests foreground location permission and updates location state.
   */
  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status !== "granted") {
        setError("Permission to access location was denied");
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData.coords);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error requesting location permission";
      setError(errorMessage);
      Alert.alert("Location Error", errorMessage);
    }
  };

  // Sync location from user settings on mount or user change
  useEffect(() => {
    if (!location && user?.settings?.location) {
      setLocation(user.settings.location);
    }
  }, [user]);

  // Update Firestore with location data when it changes
  useEffect(() => {
    if (user?.uid && location) {
      const docRef = doc(db, "users", user.uid);
      setDoc(
        docRef,
        {
          settings: { location },
          lastUpdated: new Date(),
        },
        { merge: true }
      ).catch((err) => {
        const errorMessage =
          err instanceof Error ? err.message : "Error updating location in Firestore";
        setError(errorMessage);
        Alert.alert("Firestore Error", errorMessage);
      });
    }
  }, [location, user]);

  // Context value
  const value: LocationState = {
    locationPermission,
    location,
    error,
    requestPermission,
    setLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

/**
 * Hook to access the location context.
 * @returns The current location context value
 * @throws Error if used outside LocationProvider
 */
export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
