import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { StyleProp, ViewStyle } from "react-native";

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
];

export default function TabsLayout() {
  const theme = useTheme();
  const sceneStyle: StyleProp<ViewStyle> = {
    backgroundColor: "white",
  };

  return (
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
  );
}
