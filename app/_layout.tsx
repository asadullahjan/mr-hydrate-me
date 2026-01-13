import { SplashScreen, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { DefaultTheme, PaperProvider, Text } from "react-native-paper";
import ErrorBoundary from "react-native-error-boundary";
import { SafeAreaView, View } from "react-native";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ErrorFallback from "@/components/ErrorFallBack";

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
    },
  };

  // Type assertion to treat ErrorBoundary as a React component
  const ErrorBoundaryTyped = ErrorBoundary as React.ComponentType<{
    FallbackComponent: React.ComponentType<{ error: Error; resetError: () => void }>;
    children: React.ReactNode;
  }>;

  return (
    <ErrorBoundaryTyped FallbackComponent={ErrorFallback}>
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <PaperProvider theme={theme}>
          <AuthProvider>
            <Stack
              screenOptions={{
                headerShown: false, // Hide headers for all screens
                contentStyle: {
                  backgroundColor: "white", // Default background for all stack screens
                },
              }}
            />
          </AuthProvider>
        </PaperProvider>
      </SafeAreaView>
    </ErrorBoundaryTyped>
  );
}
