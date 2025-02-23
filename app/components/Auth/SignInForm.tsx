import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, Checkbox, HelperText } from "react-native-paper";
import { FormView } from "./AuthForm";

interface SignInFormProps {
  onSignIn: (data: { email: string; password: string }) => void;
  isLoading: boolean;
  error: string | null;
  setActiveForm: (activeForm: FormView) => void;
}

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSignIn, isLoading, error, setActiveForm }) => {
  const [showPassword, setShowPassword] = useState(false);

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

  const onSubmit = (data: FormData) => {
    onSignIn({
      email: data.email,
      password: data.password,
    });
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
                mode="outlined"
                secureTextEntry={!showPassword}
                error={!!errors.password}
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
          onPress={() => setActiveForm("signup")}
        >
          Sign up
        </Button>
      </View>

      <Button
        onPress={() => setActiveForm("reset")}
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
