import { Tabs } from "expo-router"; // If needed for navigation, but not used here directly
import { FontAwesome, MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import {
  Button,
  Text,
  useTheme,
  Dialog,
  Portal,
  TextInput,
  ActivityIndicator,
} from "react-native-paper";
import { ScrollView, StyleSheet, TouchableOpacity, View, Animated, Alert } from "react-native";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useState } from "react";
import { router } from "expo-router";
import { auth, db } from "@/firebaseConfig";
import { EmailAuthProvider, reauthenticateWithCredential, signOut } from "firebase/auth";
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";
import CustomDropdown from "@/components/CustomDropdown";
import DeleteAccount from "@/components/Profile/DeleteAccount";

const Profile = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<"Light" | "Dark">("Light");
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const themeOptions = [
    { label: "Light", value: "Light" },
    { label: "Dark", value: "Dark" },
  ];

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value as "Light" | "Dark");
  };

  const handleLogout = () => {
    setLogoutDialogVisible(false);
    auth
      .signOut()
      .then(() => {
        console.log("User logged out successfully");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
        Alert.alert("Logout Error", "Failed to log out. Please try again.");
      });
  };

  return (
    <ScrollView>
      <View style={styles.mainContainer}>
        <View style={[styles.mainInfoContainer, { backgroundColor: theme.colors.background }]}>
          {/* Edit button positioned at top right */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.navigate("/(tabs)/profile/profileUpdate")}
          >
            <Feather
              name="edit-2"
              size={22}
              color={theme.colors.primary}
            />
          </TouchableOpacity>

          <View style={styles.nameContainer}>
            <Text
              variant="headlineLarge"
              style={styles.name}
            >
              {user?.profile.name}
            </Text>
            <Text>{user?.profile.email}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <View style={styles.details}>
              <Text variant="bodyLarge">Age</Text>
              <Text variant="labelLarge">{user?.profile.age}</Text>
            </View>
            <View style={styles.details}>
              <Text variant="bodyLarge">Weight</Text>
              <Text variant="labelLarge">{user?.profile.weight}</Text>
            </View>
            <View style={styles.details}>
              <Text variant="bodyLarge">Height</Text>
              <Text variant="labelLarge">{user?.profile.height}</Text>
            </View>
          </View>
        </View>

        {/* Custom Theme Dropdown */}
        <CustomDropdown
          label="Theme"
          options={themeOptions}
          value={selectedTheme}
          onChange={handleThemeChange}
          style={{ backgroundColor: theme.colors.background }}
          primaryColor={theme.colors.primary}
        />

        {/* Action Buttons Grid */}
        <View style={styles.buttonsGrid}>
          {/* Top Row */}
          <View style={styles.buttonRow}>
            {/* Reset Password Button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.background }]}
              onPress={() => router.navigate("/(tabs)/profile/resetPassword")}
            >
              <MaterialIcons
                name="lock-reset"
                size={32}
                color={theme.colors.primary}
              />
              <Text style={[styles.buttonText]}>Reset Password</Text>
            </TouchableOpacity>

            {/* Notifications Button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.background }]}
              onPress={() => console.log("Notifications")}
              disabled
            >
              <Ionicons
                name="notifications"
                size={32}
                color={theme.colors.primary}
              />
              <Text style={[styles.buttonText]}>Notifications</Text>
              <Text variant="labelSmall">Coming Soon</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Row */}
          <View style={styles.buttonRow}>
            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.background }]}
              onPress={() => setLogoutDialogVisible(true)}
            >
              <MaterialIcons
                name="logout"
                size={32}
                color={theme.colors.primary}
              />
              <Text style={[styles.buttonText]}>Logout</Text>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <DeleteAccount
              actionButtonStyles={styles.actionButton}
              buttonTextStyles={styles.buttonText}
            />
          </View>
        </View>
      </View>

      {/* Confirmation Dialogs */}
      <Portal>
        {/* Logout Confirmation */}
        <Dialog
          visible={logoutDialogVisible}
          onDismiss={() => setLogoutDialogVisible(false)}
        >
          <Dialog.Title>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLogout}>Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    padding: 10,
    gap: 10,
  },
  mainInfoContainer: {
    padding: 20,
    borderRadius: 10,
    position: "relative", // For positioning the edit button
  },
  // Edit button styles
  editButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  nameContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  name: {
    fontWeight: "bold",
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  details: {
    alignItems: "center",
  },
  // Action buttons styles
  buttonsGrid: {
    gap: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    paddingVertical: 35,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    marginTop: 5,
    fontWeight: "500",
    textAlign: "center",
  },
  input: {
    marginVertical: 10,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
});

export default Profile;
