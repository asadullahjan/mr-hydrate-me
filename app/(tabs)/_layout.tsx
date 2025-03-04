import { router, Tabs } from "expo-router";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, useTheme } from "react-native-paper";
import { Alert, StyleProp, TouchableOpacity, View, ViewStyle, StyleSheet } from "react-native";
import { useLocation } from "@/components/Location/LocationProvider";
import { useEffect } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { AddDrinkModal } from "@/components/AddDrinkModal";

// Define your main tab routes as an array of objects
const MAIN_TAB_ROUTES = [
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
  { name: "profile/resetPassword/index", icon: "", title: "Reset password", hidden: true },
  { name: "profile/profileUpdate/index", icon: "", title: "Reset password", hidden: true },
];

export default function TabsLayout() {
  const theme = useTheme();
  const { user, loading } = useAuth();
  const sceneStyle: StyleProp<ViewStyle> = {
    backgroundColor: "white",
  };

  if (loading) {
    return <ActivityIndicator style={{ margin: "auto" }} />;
  }

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.secondary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: 80,
          },
          tabBarItemStyle: {
            height: 50,
            margin: "auto",
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
              ...(tab.hidden && { href: null }),
              sceneStyle,
            }}
          />
        ))}
      </Tabs>
      {/* Plus button overlaid on top of the tab bar */}
      <AddDrinkModal>
        {/* <View style={styles.fabContainer}> */}
        <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary }]}>
          <Ionicons
            name="add"
            size={24}
            color={theme.colors.onPrimary}
          />
        </TouchableOpacity>
        {/* </View> */}
      </AddDrinkModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  fab: {
    position: "absolute",
    bottom: 55,
    alignSelf: "center",
    zIndex: 1,
    padding: 0,
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
