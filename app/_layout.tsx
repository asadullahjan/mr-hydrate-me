import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View, Text } from "react-native";

console.log("File: app/_layout.tsx loaded");

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log("RootLayout component mounted");

  useEffect(() => {
    console.log("useEffect running, attempting to hide splash screen...");
    SplashScreen.hideAsync()
      .then(() => console.log("Splash screen hidden successfully"))
      .catch((error) => console.error("Splash hide error:", error));
  }, []);

  return (
    <View
      style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}
    >
      <Text>Minimal Test: This should appear</Text>
    </View>
  );
}

// import { SplashScreen, Stack } from "expo-router";
// import React, { useEffect, useState } from "react";
// import { DefaultTheme, PaperProvider, Text } from "react-native-paper";
// import { StatusBar } from 'expo-status-bar';

// // In your main App component
// import ErrorBoundary from "react-native-error-boundary";
// import { View } from "react-native";
// import { AuthProvider } from "@/components/auth/AuthProvider";
// import { auth } from "@/firebaseConfig";
// import { onAuthStateChanged } from "firebase/auth";

// const ErrorFallback = (props) => {
//   // Display error on screen instead of just console
//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
//       <Text>Something went wrong: {props.error.toString()}</Text>
//     </View>
//   );
// };

// /**
//  * RootLayout is the top-level layout for the app, wrapping all routes in necessary providers
//  * and applying a custom theme using React Native Paper.
//  */
// export default function RootLayout() {
//   // Custom theme configuration for React Native Paper
//   const theme = {
//     ...DefaultTheme,
//     roundness: 1,
//     colors: {
//       ...DefaultTheme.colors,
//       primary: "#27ADC2", // Main action color
//       secondary: "#8BD9E5", // Secondary action color
//       background: "#D8F0FC", // App background color
//       outline: "#47AEBE", // Border color
//     },
//   };

//   return (
//     <ErrorBoundary FallbackComponent={ErrorFallback}>
//       <PaperProvider theme={theme}>
//         <AuthProvider>
//           <Stack
//             screenOptions={{
//               headerShown: false, // Hide headers for all screens
//               contentStyle: {
//                 backgroundColor: "black", // Default background for all stack screens
//               },
//             }}
//           />
//           <StatusBar style="auto" />
//         </AuthProvider>
//       </PaperProvider>
//     </ErrorBoundary>
//   );
// }
