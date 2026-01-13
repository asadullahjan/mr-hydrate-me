import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import { auth } from "@/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { router } from "expo-router";
import getErrorMessage from "../../utils/getErrorMessage";

// Define the shape of the form data
interface FormData {
  email: string;
}

/**
 * PasswordResetForm component allows users to request a password reset email.
 * It uses react-hook-form for form management and Firebase for authentication.
 */
const PasswordResetForm = () => {
  // State to store error or success messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // State to indicate loading status during email sending
  const [isLoading, setIsLoading] = useState(false);

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
    },
    mode: "onChange", // Validate on each change
  });

  /**
   * Handles form submission by sending a password reset email via Firebase.
   * @param data - Form data containing the email
   */
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, data.email);
      setSuccess("Password reset email sent. Check your inbox.");
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View key={"reset-form"}>
      {/* Email Input */}
      <Controller
        control={control}
        name="email"
        rules={{
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              label="Email"
              testID="Email"
              key={"reset-password"}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              style={styles.input}
            />
            {errors.email && (
              <HelperText
                type="error"
                visible={true}
              >
                {errors.email.message}
              </HelperText>
            )}
          </>
        )}
      />

      {/* Display error or success message */}
      {error && (
        <HelperText
          type={"error"}
          visible={true}
        >
          {error}
        </HelperText>
      )}
      {success && (
        <HelperText
          type={"info"}
          visible={true}
        >
          {success}
        </HelperText>
      )}

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      >
        {isLoading ? "Sending email..." : "Send Reset Email"}
      </Button>

      {/* Footer with navigation to login */}
      <View style={styles.loginContainer}>
        <Text variant="bodyMedium">Already have an account? </Text>
        <Button
          mode="text"
          compact
          onPress={() => router.replace("/(auth)/login")}
        >
          Login here
        </Button>
      </View>

      {/* Hint for email delivery */}
      <Text
        variant="bodyMedium"
        style={styles.hint}
      >
        Please check your junk/spam folder if you don't receive an email
      </Text>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  input: {
    marginBottom: 8,
    backgroundColor: "white",
  },
  button: {
    marginTop: 8,
  },
  hint: {
    textAlign: "center",
    opacity: 0.7,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
});

export default PasswordResetForm;
