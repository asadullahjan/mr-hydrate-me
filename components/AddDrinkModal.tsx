import React, { useState } from "react";
import { Modal, Portal, Text, Button, TextInput } from "react-native-paper";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { addWaterIntake } from "@/services/add-water-intake";
import { useAuth } from "./Auth/AuthProvider";

type TriggerProps = {
  onPress: () => void;
};

type AddDrinkModalProps = {
  children: React.ReactElement<TriggerProps>;
  onComplete: () => void;
};

export const AddDrinkModal = ({ children, onComplete }: AddDrinkModalProps) => {
  const [visible, setVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number>(250); // Default 250ml
  const [customValue, setCustomValue] = useState<string>(""); // For custom input
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { user } = useAuth();

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const addDrink = async () => {
    setLoading(true);
    try {
      const amount = customValue ? parseInt(customValue, 10) : selectedValue;
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount greater than 0");
      }
      await addWaterIntake({ user: user, amount });
      onComplete();
      setCustomValue("");
      hideModal();
    } catch (error) {
      console.error("Error adding drink:", error.message);
      // Optional: Add user feedback here (e.g., toast or alert)
      // Example with Alert:
      Alert.alert("Error", error.message || "Failed to add drink. Please try again.");
    } finally {
      setLoading(false); // Ensure loading is reset regardless of success or failure
    }
  };

  // Predefined options with specific icons
  const predefinedAmounts = [
    { value: 200, icon: "cup" }, // Small cup
    { value: 250, icon: "glass-mug" }, // Large cup
    { value: 300, icon: "bottle-soda-outline" }, // Bottle
  ];

  // Clone the trigger and add onPress
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
                  setCustomValue(""); // Reset custom input when selecting predefined
                }}
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={32} // Larger icons
                  color={
                    selectedValue === value && customValue === "" ? theme.colors.primary : "gray"
                  }
                />
                <Text style={styles.optionText}>{value}ml</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            label="Custom Amount (ml)"
            defaultValue={customValue}
            onChangeText={setCustomValue} // Only update customValue, no selectedValue change
            keyboardType="numeric"
            mode="flat"
            style={styles.textInput}
            placeholder="Enter amount"
          />
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
    marginTop: 6, // Space between icon and text
    fontSize: 14, // Smaller text
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
