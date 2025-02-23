import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import PasswordResetForm from "./PasswordResetForm";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { SvgXml } from "react-native-svg";
import { useNavigation } from "expo-router";

interface AuthFormProps {
  setUser: (user: string | null) => void;
}

export type FormView = "login" | "signup" | "reset";

const AuthForm: React.FC<AuthFormProps> = ({ setUser }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeForm, setActiveForm] = useState<FormView>("signup");
  const theme = useTheme();
  const navigation = useNavigation();

  const handleSignIn = async ({ email, password }: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user.uid);
      navigation.navigate("index" as never);
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async ({ name, email, password }: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user.uid);
      await setDoc(doc(collection(db, "users"), userCredential.user.uid), {
        name,
        onBoarding: false,
      });
      navigation.navigate("index" as never);
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
      setActiveForm("reset");
      setError("Password reset email sent. Check your inbox.");
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    const errorMessages: Record<string, string> = {
      "auth/invalid-credential": "Invalid credentials",
      "auth/user-not-found": "User not found",
      "auth/too-many-requests": "Too many requests. Try again later",
      "auth/email-already-in-use": "Email is already in use",
      "auth/weak-password": "Password is too weak",
      "auth/invalid-email": "Invalid email",
    };
    return errorMessages[errorCode] || "An error occurred. Please try again";
  };

  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <SvgXml
          xml={`<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4.48334L29.4333 13.9167C31.2989 15.781 32.5697 18.1568 33.0848 20.7434C33.6 23.3301 33.3365 26.0114 32.3276 28.4483C31.3187 30.8851 29.6097 32.968 27.4168 34.4335C25.224 35.899 22.6458 36.6812 20.0083 36.6812C17.3709 36.6812 14.7927 35.899 12.5998 34.4335C10.407 32.968 8.69801 30.8851 7.6891 28.4483C6.68019 26.0114 6.41666 23.3301 6.93184 20.7434C7.44701 18.1568 8.71776 15.781 10.5833 13.9167L20 4.48334Z" fill="#47AEBE"/>
            </svg>`}
          width={35}
          height={35}
        />
        <Text
          variant="headlineLarge"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Mr{"\n"}Hydrate Me
        </Text>
      </View>

      <View style={styles.formContainer}>
        {activeForm === "login" && (
          <SignInForm
            onSignIn={handleSignIn}
            isLoading={isLoading}
            error={error}
            setActiveForm={setActiveForm}
          />
        )}
        {activeForm === "signup" && (
          <SignUpForm
            onSignUp={handleSignUp}
            isLoading={isLoading}
            error={error}
            setActiveForm={setActiveForm}
          />
        )}
        {activeForm === "reset" && (
          <PasswordResetForm
            onResetPassword={handleResetPassword}
            isLoading={isLoading}
            error={error}
            setActiveForm={setActiveForm}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    gap: 20,
  },
  headingContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 30,
    gap: 10,
  },
  title: {
    fontWeight: "900",
    fontSize: 28,
    lineHeight: 36,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  formContainer: {
    flex: 1,
    gap: 4,
  },
});

export default AuthForm;
