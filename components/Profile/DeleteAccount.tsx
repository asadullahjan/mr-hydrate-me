import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, Alert, StyleProp, ViewStyle, TextStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, Text, useTheme, Dialog, Portal, ActivityIndicator } from "react-native-paper";
import { useAuth } from "@/components/auth/AuthProvider";
import { auth, db } from "@/firebaseConfig";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";
import getErrorMessage from "@/utils/getErrorMessage";
import TextInput from "../ui/TextInput";

// Define props interface
interface DeleteAccountProps {
  actionButtonStyles: StyleProp<ViewStyle>;
  buttonTextStyles: StyleProp<TextStyle>;
}

/**
 * DeleteAccount component provides a button and dialog to permanently delete a user's account and data.
 * @param actionButtonStyles - Styles for the delete button
 * @param buttonTextStyles - Styles for the button text
 */
const DeleteAccount: React.FC<DeleteAccountProps> = ({ actionButtonStyles, buttonTextStyles }) => {
  // Hooks for auth and theme
  const { user } = useAuth();
  const { colors } = useTheme();

  // State for dialog visibility, loading, password, and errors
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  /**
   * Handles account deletion after re-authentication and data cleanup.
   */
  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Please enter your password to delete your account.");
      return;
    }

    setIsDeletingAccount(true);

    try {
      if (!user?.uid || !user.profile.email || !auth.currentUser) {
        throw new Error("User data is incomplete or missing.");
      }

      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(user.profile.email, deletePassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Delete user's dailyRecords subcollection
      const dailyRecordsRef = collection(db, "users", user.uid, "dailyRecords");
      const dailyRecordsSnapshot = await getDocs(dailyRecordsRef);
      const deletePromises = dailyRecordsSnapshot.docs.map((docSnapshot) =>
        deleteDoc(docSnapshot.ref)
      );
      await Promise.all(deletePromises);

      // Delete user's Firestore document
      const userDocRef = doc(db, "users", user.uid);
      await deleteDoc(userDocRef);

      // Delete user's authentication account
      await auth.currentUser.delete();

      // Sign out and reset state
      await auth.signOut();
      setIsDeleteDialogVisible(false);
      Alert.alert("Success", "Your account and all data have been deleted.");
    } catch (error: any) {
      setDeleteError(getErrorMessage(error.code || error.message));
      console.error("Delete account error:", error);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
      {/* Delete Account Button */}
      <TouchableOpacity
        style={[actionButtonStyles, { backgroundColor: colors.background }]}
        onPress={() => setIsDeleteDialogVisible(true)}
        disabled={isDeletingAccount}
      >
        {isDeletingAccount ? (
          <ActivityIndicator color={colors.error} />
        ) : (
          <MaterialIcons
            name="delete-forever"
            size={32}
            color={colors.error}
          />
        )}
        <Text style={[buttonTextStyles, { color: colors.error }]}>Delete</Text>
      </TouchableOpacity>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={isDeleteDialogVisible}
          onDismiss={() => {
            setIsDeleteDialogVisible(false);
            setDeletePassword("");
            setDeleteError("");
          }}
        >
          <Dialog.Title>Delete Account</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This action cannot be undone. All your data will be permanently deleted. Please enter
              your password to confirm.
            </Text>
            <TextInput
              label="Password"
              value={deletePassword}
              onChangeText={setDeletePassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              error={!!deleteError}
              disabled={isDeletingAccount}
            />
            {deleteError && <Text style={styles.errorText}>{deleteError}</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setIsDeleteDialogVisible(false);
                setDeletePassword("");
                setDeleteError("");
              }}
              disabled={isDeletingAccount}
            >
              Cancel
            </Button>
            <Button
              textColor={colors.error}
              onPress={handleDelete}
              loading={isDeletingAccount}
              disabled={isDeletingAccount}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

// Styles for the DeleteAccount component
const styles = StyleSheet.create({
  input: {
    marginVertical: 10,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
});

export default DeleteAccount;
