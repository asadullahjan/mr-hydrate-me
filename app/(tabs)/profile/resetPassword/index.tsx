import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, HelperText } from "react-native-paper";
import { useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import getErrorMessage from "@/utils/getErrorMessage";

const ChangePassword = () => {
  const { user } = useAuth();
  const auth = getAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error("No authenticated user found.");
      }

      // Step 1: Re-authenticate using the current password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Step 2: Update the password
      await updatePassword(currentUser, newPassword);
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text
        variant="headlineMedium"
        style={styles.title}
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
      />

      {/* New Password Field */}
      <TextInput
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />

      {/* Error Message */}
      {error ? (
        <HelperText
          type="error"
          visible
        >
          {error}
        </HelperText>
      ) : null}

      {/* Success Message */}
      {success ? (
        <Text
          variant="bodyMedium"
          style={styles.successText}
        >
          {success}
        </Text>
      ) : null}

      {/* Change Password Button */}
      <Button
        mode="contained"
        onPress={handleChangePassword}
        loading={isLoading}
        disabled={!currentPassword || !newPassword || isLoading}
        style={styles.button}
      >
        Update Password
      </Button>
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
  },
  successText: {
    color: "#4CAF50",
    marginTop: 10,
    textAlign: "center",
  },
});
