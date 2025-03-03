import { Button, Text, useTheme, Dialog, Portal } from "react-native-paper";
import { ScrollView, StyleSheet, TouchableOpacity, View, Animated } from "react-native";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useState } from "react";
import { FontAwesome, MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import CustomDropdown from "@/components/CustomDropdown";
import { router } from "expo-router";

const Profile = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<"Light" | "Dark">("Light");
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const themeOptions = [
    { label: "Light", value: "Light" },
    { label: "Dark", value: "Dark" },
  ];

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value as "Light" | "Dark");
  };

  const handleLogout = () => {
    // Add your logout logic here
    setLogoutDialogVisible(false);
    console.log("User logged out");
  };

  const handleDelete = () => {
    // Add your account deletion logic here
    setDeleteDialogVisible(false);
    console.log("Account deleted");
  };

  return (
    <ScrollView>
      <View style={styles.mainContainer}>
        <View style={[styles.mainInfoContainer, { backgroundColor: theme.colors.background }]}>
          {/* Edit button positioned at top right */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => console.log("Edit profile")}
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
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.background }]}
              onPress={() => setDeleteDialogVisible(true)}
            >
              <MaterialIcons
                name="delete-forever"
                size={32}
                color={theme.colors.error}
              />
              <Text style={[styles.buttonText, { color: theme.colors.error }]}>Delete</Text>
            </TouchableOpacity>
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

        {/* Delete Account Confirmation */}
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Account</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This action cannot be undone. All your data will be permanently deleted.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button
              textColor={theme.colors.error}
              onPress={handleDelete}
            >
              Delete
            </Button>
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
});

export default Profile;
