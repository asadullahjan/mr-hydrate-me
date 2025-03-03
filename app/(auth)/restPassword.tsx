import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import { auth } from "@/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { router } from "expo-router";
import getErrorMessage from "../../utils/getErrorMessage";

interface FormData {
  email: string;
}

const PasswordResetForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const onSubmit = async ({ email }: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent. Check your inbox.");
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
                style={styles.input}
              />
              {errors.email && (
                <HelperText
                  type="error"
                  visible
                >
                  {errors.email.message}
                </HelperText>
              )}
            </>
          )}
        />
      </View>

      {error && (
        <HelperText
          type="error"
          visible
        >
          {error}
        </HelperText>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      >
        {isLoading ? "Sending email..." : "Send Reset Email"}
      </Button>

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
      <Text
        variant="bodyMedium"
        style={styles.hint}
      >
        Please check your junk/spam folder if you don't receive an email
      </Text>
    </>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
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
