import { Stack } from "expo-router";
import React from "react";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/components/Auth/AuthProvider";
import { LocationProvider } from "@/components/Location/LocationProvider";

/**
 * RootLayout is the top-level layout for the app, wrapping all routes in necessary providers
 * and applying a custom theme using React Native Paper.
 */
export default function RootLayout() {
  // Custom theme configuration for React Native Paper
  const theme = {
    ...DefaultTheme,
    roundness: 1,
    colors: {
      ...DefaultTheme.colors,
      primary: "#27ADC2", // Main action color
      secondary: "#8BD9E5", // Secondary action color
      background: "#D8F0FC", // App background color
      outline: "#47AEBE", // Border color
    },
  };

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <LocationProvider>
          <Stack
            screenOptions={{
              headerShown: false, // Hide headers for all screens
              contentStyle: {
                backgroundColor: "white", // Default background for all stack screens
              },
            }}
          />
        </LocationProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
