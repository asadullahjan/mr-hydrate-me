// app/_layout.tsx
import { Stack } from "expo-router";
import React, { useEffect, createContext, useContext, useState } from "react";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/components/Auth/AuthProvider";

export default function RootLayout() {
  const theme = {
    ...DefaultTheme,
    roundness: 1,
    colors: {
      ...DefaultTheme.colors,
      primary: "#27ADC2",
      primaryContainer: "#27ADC2",
      secondary: "#8BD9E5",
      secondaryContainer: "#8BD9E5",
      background: "#D8F0FC",
      outline: "#47AEBE",
    },
  };

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "white",
            },
          }}
        />
      </AuthProvider>
    </PaperProvider>
  );
}
