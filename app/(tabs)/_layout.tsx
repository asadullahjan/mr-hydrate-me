import { router, Tabs } from "expo-router";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, useTheme } from "react-native-paper";
import { Keyboard, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/components/auth/AuthProvider";
import { AddDrinkModal } from "@/components/AddDrinkModal";
import { LocationProvider } from "@/components/location/LocationProvider";
import { NotificationsProvider } from "@/components/notifications/NotificationsProvider";
import { useEffect, useState } from "react";

// Define the structure of a tab route
interface TabRoute {
  name: string;
  icon: string;
  title: string;
  hidden?: boolean;
}

// Main tab routes configuration
const MAIN_TAB_ROUTES: TabRoute[] = [
  { name: "home/index", icon: "home", title: "Home" },
  { name: "history/index", icon: "history", title: "History" },
  { name: "leaderboard/index", icon: "trophy", title: "Leaderboard" },
  { name: "profile/index", icon: "user", title: "Profile" },
  {
    name: "profile/notificationsSettings/index",
    icon: "",
    title: "Notifications Settings",
    hidden: true,
  },
  { name: "profile/resetPassword/index", icon: "", title: "Reset Password", hidden: true },
  { name: "profile/profileUpdate/index", icon: "", title: "Edit Profile", hidden: true },
];

/**
 * TabsLayout defines the main navigation structure with a tab bar and a floating action button.
 * Wraps the app in LocationProvider and NotificationsProvider.
 */
const TabsLayout = () => {
  // Hooks for theme and auth
  const { colors } = useTheme();
  const { user, loading: isAuthLoading } = useAuth();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Show loading indicator while auth state is being determined
  if (isAuthLoading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  return (
    <LocationProvider>
      <NotificationsProvider>
        <SafeAreaView
          style={{
            flex: 1,
          }}
        >
          <View style={styles.container}>
            {/* Main Tab Navigation */}
            <Tabs
              screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.secondary,
                headerShown: false,
                tabBarStyle: {
                  backgroundColor: colors.background,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  height: 80,
                  display: keyboardVisible ? "none" : "flex",
                },
                tabBarItemStyle: {
                  height: 50,
                  marginVertical: "auto",
                },
              }}
            >
              {MAIN_TAB_ROUTES.map((tab) => (
                <Tabs.Screen
                  key={tab.name}
                  name={tab.name}
                  options={{
                    title: tab.title,
                    tabBarIcon: ({ color, size }) => (
                      <FontAwesome
                        name={tab.icon as any}
                        size={size}
                        color={color}
                      />
                    ),
                    ...(tab.hidden && { href: null }), // Hide from tab bar if marked as hidden
                    sceneStyle: { backgroundColor: "white" },
                  }}
                />
              ))}
            </Tabs>

            {/* Floating Action Button for Adding Drink */}
            <AddDrinkModal>
              <TouchableOpacity
                style={[
                  styles.fab,
                  { backgroundColor: colors.primary, display: keyboardVisible ? "none" : "flex" },
                ]}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={colors.onPrimary}
                />
              </TouchableOpacity>
            </AddDrinkModal>
          </View>
        </SafeAreaView>
      </NotificationsProvider>
    </LocationProvider>
  );
};

// Styles for the TabsLayout component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 55,
    alignSelf: "center",
    zIndex: 1,
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TabsLayout;
