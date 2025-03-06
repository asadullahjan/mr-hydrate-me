import React, { useState } from "react";
import { Modal, Portal, Text, Button, TextInput } from "react-native-paper";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { addWaterIntake } from "@/services/add-water-intake";
import { useAuth } from "./Auth/AuthProvider";

type TriggerProps = {
  onPress: () => void;
};

type AddDrinkModalProps = {
  children: React.ReactElement<TriggerProps>;
  onComplete?: () => void;
};

export const AddDrinkModal = ({ children, onComplete }: AddDrinkModalProps) => {
  const [visible, setVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number>(250);
  const [customValue, setCustomValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // New state for error message
  const theme = useTheme();
  const { user } = useAuth();

  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    setError(null); // Clear error when closing
    setCustomValue(""); // Reset custom input
  };

  const addDrink = async () => {
    setLoading(true);
    setError(null); // Clear previous error
    try {
      const amount = customValue ? parseInt(customValue, 10) : selectedValue;
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount greater than 0");
      }
      await addWaterIntake({ user: user, amount });
      if (onComplete) onComplete();
      hideModal();
    } catch (error: any) {
      setError(error.message || "Failed to add drink. Please try again.");
      console.error("Error adding drink:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const predefinedAmounts = [
    { value: 200, icon: "cup" },
    { value: 250, icon: "glass-mug" },
    { value: 300, icon: "bottle-soda-outline" },
  ];

  const triggerWithOnPress = React.cloneElement(children, { onPress: showModal });

  return (
    <>
      {triggerWithOnPress}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 20,
            borderRadius: 10,
            gap: 25,
          }}
        >
          <Text
            variant="titleLarge"
            style={{ fontWeight: "bold" }}
          >
            Add a Drink
          </Text>
          <View style={styles.optionsContainer}>
            {predefinedAmounts.map(({ value, icon }) => (
              <Pressable
                key={value}
                style={[
                  styles.optionButton,
                  selectedValue === value && customValue === "" && styles.selectedOption,
                ]}
                onPress={() => {
                  setSelectedValue(value);
                  setCustomValue("");
                  setError(null); // Clear error when selecting predefined
                }}
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={32}
                  color={
                    selectedValue === value && customValue === "" ? theme.colors.primary : "gray"
                  }
                />
                <Text style={styles.optionText}>{value}ml</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            testID="custom-amount-input"
            label="Custom Amount (ml)"
            value={customValue} // Use value instead of defaultValue for controlled input
            onChangeText={setCustomValue}
            keyboardType="numeric"
            mode="flat"
            style={styles.textInput}
            placeholder="Enter amount"
          />
          {error && (
            <Text
              testID="error-text"
              style={{ color: theme.colors.error }}
            >
              {error}
            </Text>
          )}
          <View style={styles.buttonsContainer}>
            <Button
              mode="outlined"
              onPress={hideModal}
              style={styles.actionButtons}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={addDrink}
              loading={loading}
              disabled={loading}
              style={styles.actionButtons}
            >
              Confirm
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
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
    borderColor: "blue",
    backgroundColor: "#e6f0ff",
  },
  optionText: {
    marginTop: 6,
    fontSize: 14,
    color: "black",
  },
  textInput: {
    backgroundColor: "white",
  },
  buttonsContainer: {
    gap: 6,
    flexDirection: "row",
  },
  actionButtons: {
    flex: 1,
  },
});
