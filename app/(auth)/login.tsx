import { auth } from "@/firebaseConfig";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import getErrorMessage from "../../utils/getErrorMessage";

// Define the shape of the form data
interface FormData {
  email: string;
  password: string;
}

/**
 * SignInForm component handles user authentication with email and password.
 * It uses react-hook-form for form management and Firebase for authentication.
 */
const SignInForm = () => {
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  // State to store authentication error messages
  const [error, setError] = useState<string | null>(null);
  // State to indicate loading status during sign-in
  const [isLoading, setIsLoading] = useState(false);

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange", // Validate on each change
  });

  /**
   * Handles form submission by attempting to sign in with Firebase.
   * @param data - Form data containing email and password
   */
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.replace("/");
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View key={"signin-form"}>
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
              testID="Email"
              key={"signin-email"}
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              style={styles.input}
            />
            <HelperText
              type="error"
              visible={!!errors.email}
            >
              {errors.email?.message}
            </HelperText>
          </>
        )}
      />

      {/* Password Input */}
      <Controller
        control={control}
        name="password"
        rules={{
          required: "Password is required",
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              testID="Password"
              label="Password"
              key={"signin-password"}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              secureTextEntry={!showPassword}
              error={!!errors.password}
              autoCapitalize="none"
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  size={20}
                />
              }
            />
            <HelperText
              type="error"
              visible={!!errors.password}
            >
              {errors.password?.message}
            </HelperText>
          </>
        )}
      />

      {/* Display error message if authentication fails */}
      {error && (
        <HelperText
          type="error"
          visible={true}
        >
          {error}
        </HelperText>
      )}

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
        key={"signin"}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      {/* Footer with navigation to signup */}
      <View style={styles.footer}>
        <Text variant="bodyMedium">Don't have an account yet? </Text>
        <Button
          mode="text"
          compact
          onPress={() => router.replace("/(auth)/signup")}
        >
          Sign up
        </Button>
      </View>

      {/* Forgot Password Link */}
      <Button
        mode="text"
        compact
        onPress={() => router.replace("/(auth)/restPassword")}
      >
        Forgot password?
      </Button>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    backgroundColor: "white",
  },
  button: {
    marginVertical: 10,
  },
});

export default SignInForm;
