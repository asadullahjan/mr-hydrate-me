import { View, StyleSheet } from "react-native";
import { Text, Button, HelperText, useTheme } from "react-native-paper";
import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import getErrorMessage from "@/utils/getErrorMessage";
import { router } from "expo-router";
import TextInput from "@/components/ui/TextInput";
import HeaderWithBack from "@/components/ui/HeaderWithBack";
import { auth } from "@/firebaseConfig";

/**
 * ChangePassword screen allows users to update their account password.
 */
const ChangePassword = () => {
  // Hooks for auth and theme
  const { user } = useAuth();
  const { colors } = useTheme();

  // Form state with react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
    mode: "onChange", // Validate on every change
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /**
   * Handles password change by re-authenticating and updating the password.
   * @param data Form data containing currentPassword and newPassword
   */
  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    setSuccess("");
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        setError("No authenticated user found.");
        return;
      }

      // Re-authenticate with current password
      const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update to new password
      await updatePassword(currentUser, data.newPassword);
      setSuccess("Password updated successfully!");
      router.navigate("/(tabs)/profile");
    } catch (err: any) {
      console.error(err);
      setError(getErrorMessage(err.code || err.message));
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <HeaderWithBack
        title="Change Password"
        backRoute="/(tabs)/profile"
      />

      {/* Current Password Field */}
      <View style={styles.input}>
        <Controller
          control={control}
          name="currentPassword"
          rules={{
            required: "Current password is required",
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                label="Current Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                secureTextEntry
                error={!!errors.currentPassword}
                outlineColor={colors.primary}
                activeOutlineColor={colors.primary}
                autoCapitalize="none"
              />
              {errors.currentPassword && (
                <HelperText
                  type="error"
                  visible={!!errors.currentPassword}
                >
                  {errors.currentPassword.message}
                </HelperText>
              )}
            </>
          )}
        />
      </View>
      {/* New Password Field */}
      <View style={styles.input}>
        <Controller
          control={control}
          name="newPassword"
          rules={{
            required: "New password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                label="New Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                secureTextEntry
                error={!!errors.newPassword}
                outlineColor={colors.primary}
                activeOutlineColor={colors.primary}
                autoCapitalize="none"
              />
              {errors.newPassword && (
                <HelperText
                  type="error"
                  visible={!!errors.newPassword}
                >
                  {errors.newPassword.message}
                </HelperText>
              )}
            </>
          )}
        />
      </View>

      {/* General Error or Success Message */}
      {error && ( // Handle Firebase errors not tied to specific fields
        <HelperText
          type="error"
          style={[styles.message]}
        >
          {error}
        </HelperText>
      )}
      {success && (
        <Text
          variant="bodyMedium"
          style={[styles.message]}
        >
          {success}
        </Text>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit(handleChangePassword)}
        loading={isSubmitting}
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
  },
  message: {
    marginBottom: 5,
  },
});

export default ChangePassword;
