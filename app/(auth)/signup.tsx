import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { auth, db } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, collection } from "firebase/firestore";
import { router } from "expo-router";
import getErrorMessage from "../../utils/getErrorMessage";

// Define the shape of the form data
interface FormData {
  email: string;
  password: string;
}

/**
 * SignUpForm component handles user registration with email and password.
 * It uses react-hook-form for form management and Firebase for authentication and data storage.
 */
const SignUpForm = () => {
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  // State to store error messages
  const [error, setError] = useState<string | null>(null);
  // State to indicate loading status during sign-up
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
   * Handles form submission by creating a new user with Firebase Auth and initializing Firestore data.
   * @param data - Form data containing email and password
   */
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      // Initialize user data in Firestore
      await setDoc(
        doc(collection(db, "users"), userCredential.user.uid),
        {
          onBoardingCompleted: false,
          currentStreak: 0,
        },
        { merge: true }
      );
      router.replace("/");
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View key={"signup-form"}>
      {/* Email Input */}
      <Controller
        control={control}
        name="email"
        rules={{
          required: "Email is required",
          pattern: {
            value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            message: "Invalid email format",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              label="Email"
              testID="Email"
              key={"signup-email"}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
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
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              label="Password"
              testID="Password"
              key={"signup-password"}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              mode="outlined"
              error={!!errors.password}
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

      {/* Display error message if sign-up fails */}
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
        key={"signup"}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>

      {/* Footer with navigation to login */}
      <View style={styles.loginContainer}>
        <Text variant="bodyMedium">Already have an account? </Text>
        <Button
          mode="text"
          compact
          onPress={() => router.replace("/(auth)/login")}
          style={styles.loginButton}
        >
          Sign in here
        </Button>
      </View>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  input: {
    backgroundColor: "white",
  },
  button: {
    marginVertical: 10,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButton: {
    marginLeft: -8,
  },
});

export default SignUpForm;
