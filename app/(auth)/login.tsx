import { auth } from "@/firebaseConfig";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, Checkbox, HelperText } from "react-native-paper";
import getErrorMessage from "./utils/getErrorMessage";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async ({ email, password }: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View>
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
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
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
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                secureTextEntry={!showPassword}
                error={!!errors.password}
                autoCapitalize="none"
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
      </View>

      {error && (
        <HelperText
          type="error"
          visible={true}
        >
          {error}
        </HelperText>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <View style={styles.footer}>
        <Text variant="bodyMedium">Don't have an account yet? </Text>
        <Button
          mode="text"
          compact
          onPress={() => router.navigate("/(auth)/signup")}
        >
          Sign up
        </Button>
      </View>

      <Button
        onPress={() => router.navigate("/(auth)/restPassword")}
        mode="text"
        compact
      >
        Forgot password?
      </Button>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  hint: {
    textAlign: "center",
    opacity: 0.7,
  },
});

export default SignInForm;
