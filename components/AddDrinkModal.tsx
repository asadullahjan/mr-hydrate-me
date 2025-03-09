import React, { useState } from "react";
import { Modal, Portal, Text, Button, TextInput } from "react-native-paper";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { addWaterIntake } from "@/services/add-water-intake";
import { useAuth } from "./auth/AuthProvider";

// Define props interfaces
interface TriggerProps {
  onPress: () => void;
}

interface AddDrinkModalProps {
  children: React.ReactElement<TriggerProps>;
  onComplete?: () => void;
}

/**
 * AddDrinkModal provides a modal interface for adding water intake with predefined or custom amounts.
 * @param children - The trigger element (e.g., a button) to open the modal
 * @param onComplete - Optional callback to execute after successful addition
 */
export const AddDrinkModal: React.FC<AddDrinkModalProps> = ({ children, onComplete }) => {
  // State for modal visibility, selection, and form handling
  const [isVisible, setIsVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number>(250);
  const [customValue, setCustomValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks for theme and auth
  const { colors } = useTheme();
  const { user } = useAuth();

  // Modal control functions
  const showModal = () => setIsVisible(true);
  const hideModal = () => {
    setIsVisible(false);
    setCustomValue("");
    setError(null);
  };

  /**
   * Adds water intake based on selected or custom value.
   */
  const addDrink = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const amount = customValue ? parseInt(customValue, 10) : selectedValue;
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount greater than 0");
      }
      if (!user) throw new Error("User not authenticated");

      await addWaterIntake({ user, amount });
      if (onComplete) onComplete();
      hideModal();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add drink. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Predefined water intake options
  const predefinedAmounts = [
    { value: 200, icon: "cup" },
    { value: 250, icon: "glass-mug" },
    { value: 300, icon: "bottle-soda-outline" },
  ];

  // Clone the trigger element with onPress handler
  const triggerWithOnPress = React.cloneElement(children, { onPress: showModal });

  return (
    <>
      {triggerWithOnPress}
      <Portal>
        <Modal
          visible={isVisible}
          onDismiss={hideModal}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.surface }]}
        >
          {/* Modal Title */}
          <Text
            variant="titleLarge"
            style={styles.title}
          >
            Add a Drink
          </Text>

          {/* Predefined Options */}
          <View style={styles.optionsContainer}>
            {predefinedAmounts.map(({ value, icon }) => (
              <Pressable
                key={value}
                testID={selectedValue === value && !customValue ? "selected-amount" : undefined}
                style={[
                  styles.optionButton,
                  selectedValue === value &&
                    !customValue && [
                      styles.selectedOption,
                      { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
                    ],
                ]}
                onPress={() => {
                  setSelectedValue(value);
                  setCustomValue("");
                  setError(null);
                }}
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={32}
                  color={
                    selectedValue === value && !customValue ? colors.primary : colors.onSurface
                  }
                />
                <Text style={styles.optionText}>{value} ml</Text>
              </Pressable>
            ))}
          </View>

          {/* Custom Amount Input */}
          <TextInput
            testID="custom-amount-input"
            label="Custom Amount (ml)"
            value={customValue}
            onChangeText={setCustomValue}
            keyboardType="numeric"
            mode="flat"
            style={styles.textInput}
            placeholder="Enter amount"
            error={!!error}
            disabled={isLoading}
          />

          {/* Error Message */}
          {error && (
            <Text
              testID="error-text"
              style={[styles.errorText, { color: colors.error }]}
            >
              {error}
            </Text>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <Button
              mode="outlined"
              onPress={hideModal}
              style={styles.actionButton}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={addDrink}
              loading={isLoading}
              disabled={isLoading}
              style={styles.actionButton}
            >
              Confirm
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

// Styles for the AddDrinkModal component
const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
    gap: 25,
  },
  title: {
    fontWeight: "bold",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "gray",
    borderStyle: "dashed",
  },
  selectedOption: {
    borderStyle: "solid",
  },
  optionText: {
    marginTop: 6,
    fontSize: 14,
  },
  textInput: {
    backgroundColor: "white",
  },
  errorText: {
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});

export default AddDrinkModal;
