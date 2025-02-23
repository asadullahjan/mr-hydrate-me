import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

interface SignInFormProps {
  onSignIn: (email: string, password: string) => void;
  isLoading: boolean;
  error: string | null;
  setShowLogin: (show: boolean) => void;
  setShowResetPassword: (show: boolean) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  onSignIn,
  isLoading,
  error,
  setShowLogin,
  setShowResetPassword,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onSignIn(email, password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="name@company.com"
        style={styles.input}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
        style={styles.input}
      />
      <View style={styles.checkboxContainer}>
        <TouchableOpacity style={styles.checkbox}>
          <Text style={styles.checkboxText}>✓</Text>
        </TouchableOpacity>
        <Text style={styles.rememberText}>Remember me</Text>
        <TouchableOpacity
          onPress={() => setShowResetPassword(true)}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button
        title={isLoading ? "Signing in..." : "Sign In"}
        onPress={handleSubmit}
        disabled={isLoading}
        color="#D3D3D3" // Light grey for the button background
      />
      <Text style={styles.signupText}>
        Don’t have an account yet?{" "}
        <TouchableOpacity onPress={() => setShowLogin(false)}>
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#F5F5F5",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5D5", // Light yellow for checked state (simulating Tailwind's accent-primary)
  },
  checkboxText: {
    fontSize: 12,
    color: "#000",
  },
  rememberText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 5,
  },
  forgotPassword: {
    padding: 5,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#007BFF", // Blue for Tailwind's text-primary
    textDecorationLine: "underline",
  },
  error: {
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  signupText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  signupLink: {
    fontSize: 14,
    color: "#007BFF", // Blue for Tailwind's text-primary
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default SignInForm;
