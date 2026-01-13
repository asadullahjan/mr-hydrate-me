import { Stack } from "expo-router";
import { SafeAreaView } from "react-native";

export default function OnboardingLayout() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
    </SafeAreaView>
  );
}
