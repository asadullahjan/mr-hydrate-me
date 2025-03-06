import React from "react";
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { Text, useTheme } from "react-native-paper";

// Define the SVG logo as a constant for better readability and reusability
const LOGO_SVG = `
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4.48334L29.4333 13.9167C31.2989 15.781 32.5697 18.1568 33.0848 20.7434C33.6 23.3301 33.3365 26.0114 32.3276 28.4483C31.3187 30.8851 29.6097 32.968 27.4168 34.4335C25.224 35.899 22.6458 36.6812 20.0083 36.6812C17.3709 36.6812 14.7927 35.899 12.5998 34.4335C10.407 32.968 8.69801 30.8851 7.6891 28.4483C6.68019 26.0114 6.41666 23.3301 6.93184 20.7434C7.44701 18.1568 8.71776 15.781 10.5833 13.9167L20 4.48334Z" fill="#47AEBE"/>
  </svg>
`;

// Main layout component for the authentication screens
export default function AuthLayout() {
  const theme = useTheme();

  // Render the layout with a header containing the logo and title, followed by the navigation stack
  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        {/* Display the application logo using an SVG */}
        <SvgXml
          xml={LOGO_SVG}
          width={35}
          height={35}
        />
        {/* Application title with dynamic theme coloring */}
        <Text
          variant="headlineLarge"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Mr{"\n"}Hydrate Me
        </Text>
      </View>
      {/* Navigation stack for authentication screens */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
        }}
      />
    </View>
  );
}

// Styles for the layout, ensuring a clean and consistent presentation
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  headingContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 30,
    gap: 10,
  },
  title: {
    fontWeight: "900",
    fontSize: 28,
    lineHeight: 36,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
