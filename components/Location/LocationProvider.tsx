// LocationContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import * as Location from "expo-location";
import { updateUserData } from "@/services/update-user-profile";
import { useAuth } from "../Auth/AuthProvider";
import { Alert } from "react-native";
import { db } from "@/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

interface LocationState {
  locationPermission: string | null;
  location: Location.LocationObjectCoords | null;
  error: string | null;
  requestPermission: () => Promise<void>;
  setLocation: (location: Location.LocationObjectCoords | null) => void;
}

const LocationContext = createContext<LocationState | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locationPermission, setLocationPermission] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const requestPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status !== "granted") {
        setError("Permission to access location was denied");
        return;
      }

      let locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData.coords);
    } catch (err) {
      setError("Error requesting location permission");
    }
  };

  useEffect(() => {
    const docRef = doc(db, `users/${user?.uid}`);
    setDoc(
      docRef,
      {
        settings: { location: location },
        lastUpdated: new Date(),
      },
      { merge: true }
    );
  }, [location]);

  const value = {
    locationPermission,
    location,
    error,
    requestPermission,
    setLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
