import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, useTheme, Dialog, Portal } from "react-native-paper";
import { FontAwesome, MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@/components/Auth/AuthProvider";
import DeleteAccount from "@/components/Profile/DeleteAccount";

/**
 * Profile screen displays user information and provides options to edit profile,
 * reset password, manage notifications, log out, and delete the account.
 */
const Profile = () => {
  // Hooks for auth and theme
  const { user } = useAuth();
  const { colors } = useTheme();

  // State for logout dialog visibility
  const [isLogoutDialogVisible, setIsLogoutDialogVisible] = useState(false);

  /**
   * Handles user logout by signing out from Firebase Auth.
   */
  const handleLogout = () => {
    setIsLogoutDialogVisible(false);
    router.replace("/(auth)/login"); // Redirect to login after logout
  };

  return (
    <ScrollView contentContainerStyle={styles.mainContainer}>
      {/* User Information Section */}
      <View style={[styles.mainInfoContainer, { backgroundColor: colors.background }]}>
        {/* Edit Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.navigate("/(tabs)/profile/profileUpdate")}
        >
          <Feather
            name="edit-2"
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* Name and Email */}
        <View style={styles.nameContainer}>
          <Text
            variant="headlineLarge"
            style={styles.name}
          >
            {user?.profile.name || "User"}
          </Text>
          <Text variant="bodyMedium">{user?.profile.email || "No email"}</Text>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.details}>
            <Text variant="bodyLarge">Age</Text>
            <Text variant="labelLarge">{user?.profile.age || "N/A"}</Text>
          </View>
          <View style={styles.details}>
            <Text variant="bodyLarge">Weight</Text>
            <Text variant="labelLarge">{user?.profile.weight || "N/A"}</Text>
          </View>
          <View style={styles.details}>
            <Text variant="bodyLarge">Height</Text>
            <Text variant="labelLarge">{user?.profile.height || "N/A"}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons Grid */}
      <View style={styles.buttonsGrid}>
        {/* Top Row */}
        <View style={styles.buttonRow}>
          {/* Reset Password Button */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.background }]}
            onPress={() => router.navigate("/(tabs)/profile/resetPassword")}
          >
            <MaterialIcons
              name="lock-reset"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>

          {/* Notifications Button */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.background }]}
            onPress={() => router.navigate("/(tabs)/profile/notificationsSettings")}
          >
            <Ionicons
              name="notifications"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.buttonText}>Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Row */}
        <View style={styles.buttonRow}>
          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.background }]}
            onPress={() => setIsLogoutDialogVisible(true)}
          >
            <MaterialIcons
              name="logout"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <DeleteAccount
            actionButtonStyles={styles.actionButton}
            buttonTextStyles={styles.buttonText}
          />
        </View>
      </View>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={isLogoutDialogVisible}
          onDismiss={() => setIsLogoutDialogVisible(false)}
        >
          <Dialog.Title>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to log out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsLogoutDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLogout}>Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

// Styles for the Profile component
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
