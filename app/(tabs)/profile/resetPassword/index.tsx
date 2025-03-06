import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, HelperText, useTheme } from "react-native-paper";
import { useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import getErrorMessage from "@/utils/getErrorMessage";

/**
 * ChangePassword screen allows users to update their account password.
 */
const ChangePassword = () => {
  // Hooks for auth and theme
  const { user } = useAuth();
  const { colors } = useTheme();
  const auth = getAuth();

  // State for form inputs, feedback, and loading
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles password change by re-authenticating and updating the password.
   */
  const handleChangePassword = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error("No authenticated user found.");
      }

      // Re-authenticate with current password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update to new password
      await updatePassword(currentUser, newPassword);
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(getErrorMessage(err.code || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text
        variant="headlineMedium"
        style={[styles.title, { color: colors.primary }]}
      >
        Change Password
      </Text>

      {/* Current Password Field */}
      <TextInput
        label="Current Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
        error={!!error}
        outlineColor={colors.primary}
        activeOutlineColor={colors.primary}
      />

      {/* New Password Field */}
      <TextInput
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
        error={!!error}
        outlineColor={colors.primary}
        activeOutlineColor={colors.primary}
      />

      {/* Error Message */}
      {error && (
        <HelperText
          type="error"
          visible={!!error}
        >
          {error}
        </HelperText>
      )}

      {/* Success Message */}
      {success && (
        <Text
          variant="bodyMedium"
          style={[styles.successText]}
        >
          {success}
        </Text>
      )}

      {/* Change Password Button */}
      <Button
        mode="contained"
        onPress={handleChangePassword}
        loading={isLoading}
        disabled={!currentPassword || !newPassword || isLoading}
        style={styles.button}
        labelStyle={{ color: colors.onPrimary }}
      >
        Update Password
      </Button>
    </View>
  );
};

// Styles for the ChangePassword component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "white",
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
  },
  successText: {
    marginTop: 10,
    textAlign: "center",
  },
});

export default ChangePassword;
