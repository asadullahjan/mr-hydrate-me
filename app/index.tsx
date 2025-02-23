import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Update import for Firebase v9+
import AuthForm from "./components/Auth/AuthForm"; // Adjust path as needed
import { auth } from "@/firebaseConfig";

// Assuming getUserLoginState is a function to check Firebase auth state
const getUserLoginState = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      resolve(user ? user.uid : null);
    });
  });
};

export default function Index() {
  const [showAuth, setShowAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Use effect to check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const handleSignin = () => {
    setShowAuth(true);
    setShowLogin(true); // Set to show login form
  };

  const handleSignup = () => {
    setShowAuth(true);
    setShowLogin(false); // Set to show signup form
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setShowAuth(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      {!user ? (
        <>
          {/* {showAuth ? ( */}
          <View style={styles.authContainer}>
            <View style={styles.authContent}>
              <AuthForm
                setUser={setUser}
                isLogin={showLogin}
              />
            </View>
          </View>
          {/* ) : (
            <View style={styles.loginButtonsContainer}>
              <Text style={styles.title}>Create notes on the fly</Text>
              <TouchableOpacity
                onPress={handleSignin}
                style={styles.button}
              >
                <Text>LogIn</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSignup}
                style={styles.button}
              >
                <Text>SignUp</Text>
              </TouchableOpacity>
            </View>
          )} */}
        </>
      ) : (
        <View style={styles.loggedInContainer}>
          <Text style={styles.loggedInText}>Hiiiii</Text>
          <Button
            title="Logout"
            onPress={logout}
            color="#D3D3D3" // Light grey for the button background
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    minWidth: 300,
    minHeight: 100,
    backgroundColor: "white",
  },
  authContainer: {
    flex: 1,
    padding: 8,
  },
  authContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 300,
    minHeight: 100,
    backgroundColor: "#E5E7EB", // Light grey for bg-gray-200
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#333",
  },
  button: {
    marginBottom: 8,
  },
  loggedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
  loggedInText: {
    fontSize: 24,
    color: "#333",
    marginBottom: 10,
  },
});
