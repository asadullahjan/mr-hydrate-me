import React from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Feather } from "@expo/vector-icons";

interface SignUpFormProps {
  onSignUp: (email: string, password: string) => void; // Simplified to remove confirmPassword
  isLoading: boolean;
  error: string | null;
  setShowLogin: (show: boolean) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp, isLoading, error, setShowLogin }) => {
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

  const onSubmit = (data: { email: string; password: string }) => {
    onSignUp(data.email, data.password);
  };

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <Text style={styles.label}>Email</Text>
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
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="name@company.com"
            style={[styles.input, errors.email ? { borderColor: "red" } : {}]}
          />
        )}
        name="email"
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Password Input */}
      <Text style={styles.label}>Password</Text>
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
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            placeholder="••••••••"
            style={[styles.input, errors.password ? { borderColor: "red" } : {}]}
          />
        )}
        name="password"
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      {/* Sign In Button */}
      <Button
        title={isLoading ? "Signing in..." : "Sign in"}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        color="#47AEBE" // Teal color matching the image
      />

      {/* Error Message */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Hint for Signup */}
      <Text style={styles.hintText}>
        For signup we require additional info like age, weight, height etc
      </Text>

      {/* Login Link */}
      <Text style={styles.loginText}>
        Already have an account?{" "}
        <TouchableOpacity onPress={() => setShowLogin(true)}>
          <Text style={styles.loginLink}>Login here</Text>
        </TouchableOpacity>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50", // Teal color for the title
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  error: {
    color: "red",
    fontSize: 13,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  hintText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#000000",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  loginText: {
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    marginTop: 10,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#47AEBE", // Teal color for the link
    textDecorationLine: "underline",
  },
});

export default SignUpForm;
