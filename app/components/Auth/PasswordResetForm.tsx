import React from "react";
import { View, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import { FormView } from "./AuthForm";

interface PasswordResetFormProps {
  onResetPassword: (data: { email: string }) => void;
  isLoading: boolean;
  error: string | null;
  setActiveForm: (activeForm: FormView) => void;
}

interface FormData {
  email: string;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onResetPassword,
  isLoading,
  error,
  setActiveForm,
}) => {
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

  const onSubmit = (data: FormData) => {
    onResetPassword(data);
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
          onPress={() => setActiveForm("login")}
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
