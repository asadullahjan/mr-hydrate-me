import { MaterialIcons } from "@expo/vector-icons";
import {
  Button,
  Text,
  useTheme,
  Dialog,
  Portal,
  TextInput,
  ActivityIndicator,
} from "react-native-paper";
import { StyleSheet, TouchableOpacity, Alert, StyleProp, ViewStyle, TextStyle } from "react-native";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";
import getErrorMessage from "@/utils/getErrorMessage";

const DeleteAccount = ({
  actionButtonStyles,
  buttonTextStyles,
}: {
  actionButtonStyles: StyleProp<ViewStyle>;
  buttonTextStyles: StyleProp<TextStyle>;
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false); // Loading state for deletion
  const [deletePassword, setDeletePassword] = useState(""); // Password for deletion
  const [deleteError, setDeleteError] = useState(""); // Error for password or deletion

  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Please enter your password to delete your account.");
      return;
    }

    setDeletingAccount(true); // Start loading state

    try {
      // Re-authenticate the user with the provided password
      const credential = EmailAuthProvider.credential(user?.profile.email || "", deletePassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);

      // Delete all documents in the user's dailyRecords subcollection
      const dailyRecordsCollectionRef = collection(db, "users", user?.uid!, "dailyRecords");
      const dailyRecordsSnapshot = await getDocs(dailyRecordsCollectionRef);
      const deletePromises = dailyRecordsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete the user's document from Firestore
      const userDocRef = doc(db, "users", user?.uid!);
      await deleteDoc(userDocRef);

      // Delete the user's authentication account
      await auth.currentUser?.delete();

      // Sign out the user and update app state
      await auth.signOut(); // Clear the user from Firebase state
      setDeleteDialogVisible(false);
      setDeletingAccount(false); 
      Alert.alert("Success", "Your account and all data have been deleted.");
    } catch (error: any) {
      setDeletingAccount(false); // Stop loading state on error
      console.error(error.code);
      setDeleteError(getErrorMessage(error.code));
    }
  };

  return (
    <>
      {/* Delete Account Button */}
      <TouchableOpacity
        style={[actionButtonStyles, { backgroundColor: theme.colors.background }]}
        onPress={() => setDeleteDialogVisible(true)}
        disabled={deletingAccount}
      >
        {deletingAccount ? (
          <ActivityIndicator />
        ) : (
          <MaterialIcons
            name="delete-forever"
            size={32}
            color={theme.colors.error}
          />
        )}
        <Text style={[buttonTextStyles, { color: theme.colors.error }]}>Delete</Text>
      </TouchableOpacity>

      {/* Confirmation Dialogs */}
      <Portal>
        {/* Delete Account Confirmation with Password */}
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => {
            setDeleteDialogVisible(false);
            setDeletePassword(""); // Clear password on dismiss
            setDeleteError(""); // Clear error on dismiss
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
              onChangeText={setDeletePassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              error={!!deleteError}
            />
            {deleteError && <Text style={styles.errorText}>{deleteError}</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setDeleteDialogVisible(false);
                setDeletePassword(""); // Clear password on cancel
                setDeleteError(""); // Clear error on cancel
              }}
            >
              Cancel
            </Button>
            <Button
              textColor={theme.colors.error}
              onPress={handleDelete}
              loading={deletingAccount}
              disabled={deletingAccount}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

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
