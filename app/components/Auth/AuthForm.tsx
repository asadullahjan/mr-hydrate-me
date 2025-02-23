import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Button, TextInput, Image } from "react-native";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import PasswordResetForm from "./PasswordResetForm";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { auth, db } from "@/firebaseConfig";

// Define props for the component
interface AuthFormProps {
  setUser: (user: string | null) => void; // Update user state
  isLogin: boolean; // Determines if showing login or signup form
}

const AuthForm: React.FC<AuthFormProps> = ({ setUser, isLogin }) => {
  const [showLogin, setShowLogin] = useState(isLogin);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const navigation = useNavigation();

  const handleSignIn = async ({ email, password }: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user.uid); // Set user ID or other identifier
      navigation.navigate("Main" as never); // Navigate to MainPage
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async ({ email, password, confirmPassword }: any) => {
    setIsLoading(true);
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user.uid);

      // Store additional user info in Firestore (age, weight, height can be updated later in Profile)
      await setDoc(doc(collection(db, "users"), userCredential.user.uid), {
        name: "",
        email: email,
        age: 0,
        weight: 0,
        height: 0,
      });

      navigation.navigate("Main" as never);
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async ({ email }: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setShowResetPassword(false);
      setError("Password reset email sent. Check your inbox.");
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/invalid-credential":
        return "Invalid credentials";
      case "auth/user-not-found":
        return "User not found";
      case "auth/too-many-requests":
        return "Too many requests. Try again later";
      case "auth/email-already-in-use":
        return "Email is already in use";
      case "auth/weak-password":
        return "Password is too weak";
      case "auth/invalid-email":
        return "Invalid email";
      default:
        return "An error occurred. Please try again";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        {/* Water Drop Icon */}
        <Image
          src={"../../../assets/images/droplet.png"}
          style={{ width: 100, height: 100, marginBottom: 20, backgroundColor: "brown" }}
        />
        {/* Title */}
        <Text style={styles.title}>Mr Hydrate Me</Text>{" "}
      </View>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
        />
      ) : (
        <>
          {showLogin && !showResetPassword && (
            <SignInForm
              onSignIn={handleSignIn}
              isLoading={isLoading}
              error={error}
              setShowLogin={setShowLogin}
              setShowResetPassword={setShowResetPassword}
            />
          )}
          {!showLogin && !showResetPassword && (
            <SignUpForm
              onSignUp={handleSignUp}
              isLoading={isLoading}
              error={error}
              setShowLogin={setShowLogin}
            />
          )}
          {showResetPassword && (
            <PasswordResetForm
              onResetPassword={handleResetPassword}
              isLoading={isLoading}
              error={error}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  headingContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  form: { gap: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5 },
  error: { color: "red", marginVertical: 5 },
});

export default AuthForm;
