import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, IconButton, useTheme, Dialog, Portal, Button } from "react-native-paper";
import { Href, useRouter } from "expo-router";
import { VariantProp } from "react-native-paper/lib/typescript/components/Typography/types";

interface HeaderWithBackProps {
  title: string;
  backRoute?: Href;
  hasUnsavedChanges?: boolean;
  confirmationDialogProps?: {
    title?: string;
    message?: string;
    stayText?: string;
    discardText?: string;
  };
  rightComponent?: React.ReactNode;
  titleVariant?: VariantProp<never>;
}

/**
 * HeaderWithBack - A reusable header component with centered title and optional back button
 * Includes confirmation dialog for handling unsaved changes
 * Back button is shown automatically when backRoute is provided
 */
const HeaderWithBack: React.FC<HeaderWithBackProps> = ({
  title,
  backRoute,
  hasUnsavedChanges = false,
  confirmationDialogProps = {
    title: "Unsaved Changes",
    message: "You have unsaved changes. Are you sure you want to go back?",
    stayText: "Stay",
    discardText: "Discard",
  },
  rightComponent = null,
  titleVariant = "headlineMedium",
}) => {
  const { colors } = useTheme();
  const router = useRouter();
  const showBackButton = !!backRoute;
  const [dialogVisible, setDialogVisible] = useState(false);

  /**
   * Handles back button press with confirmation dialog for unsaved changes.
   * Shows a dialog if there are unsaved changes before navigating back.
   */
  const handleBackPress = () => {
    const navigateBack = () => {
      if (backRoute) {
        router.push(backRoute);
      } else {
        router.back();
      }
    };

    if (hasUnsavedChanges) {
      setDialogVisible(true);
    } else {
      navigateBack();
    }
  };

  const handleDiscard = () => {
    setDialogVisible(false);
    if (backRoute) {
      router.push(backRoute);
    } else {
      router.back();
    }
  };

  const handleStay = () => {
    setDialogVisible(false);
  };

  return (
    <View style={styles.headerContainer}>
      {showBackButton ? (
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBackPress}
          iconColor={colors.primary}
          style={styles.backButton}
        />
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text
        variant={titleVariant}
        style={[styles.title]}
      >
        {title}
      </Text>

      {rightComponent ? rightComponent : <View style={styles.placeholder} />}

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={handleStay}
        >
          <Dialog.Title>{confirmationDialogProps.title || "Unsaved Changes"}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {confirmationDialogProps.message ||
                "You have unsaved changes. Are you sure you want to go back?"}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleStay}>{confirmationDialogProps.stayText || "Stay"}</Button>
            <Button
              onPress={handleDiscard}
              textColor={colors.error || "#FF0000"}
            >
              {confirmationDialogProps.discardText || "Discard"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    width: "100%",
  },
  backButton: {
    margin: 0,
    width: 48,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  placeholder: {
    width: 48,
  },
});

export default HeaderWithBack;
