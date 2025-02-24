import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { StyleProp, ViewStyle } from "react-native";

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
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome
              name="home"
              size={23}
              color={color}
            />
          ),
          sceneStyle,
        }}
      />
      <Tabs.Screen
        name="history/index"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome
              name="history"
              size={23}
              color={color}
            />
          ),
          sceneStyle,
        }}
      />
      <Tabs.Screen
        name="leaderboard/index"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome
              name="trophy"
              size={23}
              color={color}
            />
          ),
          sceneStyle,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome
              name="user"
              size={23}
              color={color}
            />
          ),
          sceneStyle,
        }}
      />
    </Tabs>
  );
}
