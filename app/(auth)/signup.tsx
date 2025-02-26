import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  TextInput,
  Button,
  Text,
  useTheme,
  Surface,
  HelperText,
  Provider as PaperProvider,
  DefaultTheme,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { auth, db } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, collection } from "firebase/firestore";
import { router, useNavigation } from "expo-router";
import getErrorMessage from "./utils/getErrorMessage";

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({ email, password }: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(
        doc(collection(db, "users"), userCredential.user.uid),
        {
          onBoardingCompleted: false,
        },
        { merge: true }
      );
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View>
        {/* Email Input */}
        <Controller
          control={control}
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
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                error={!!errors.email}
              />
              <HelperText
                type="error"
                visible={!!errors.email}
              >
                {errors.email?.message}
              </HelperText>
            </>
          )}
          name="email"
        />

        {/* Password Input */}
        <Controller
          control={control}
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
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                    size={20}
                  />
                }
                mode="outlined"
                error={!!errors.password}
              />
              <HelperText
                type="error"
                visible={!!errors.password}
              >
                {errors.password?.message}
              </HelperText>
            </>
          )}
          name="password"
        />
      </View>

      {/* Error Message */}
      {error && (
        <HelperText
          type="error"
          visible={!!error}
        >
          {error}
        </HelperText>
      )}

      {/* Sign Up Button */}
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>

      {/* Login Link */}
      <View style={styles.loginContainer}>
        <Text variant="bodyMedium">Already have an account? </Text>
        <Button
          mode="text"
          compact
          onPress={() => router.replace("/(auth)/login")}
          style={styles.loginButton}
        >
          Singin here
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  surface: {
    padding: 20,
    width: "100%",
    alignItems: "center",
    elevation: 4,
    borderRadius: 8,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
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
