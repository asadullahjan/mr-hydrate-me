import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

// Define interfaces for props and options
interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  primaryColor?: string;
}

/**
 * CustomDropdown provides a collapsible dropdown menu for selecting options.
 * @param label - The label displayed above the dropdown
 * @param options - Array of dropdown options with label and value
 * @param value - The currently selected value
 * @param onChange - Callback function when an option is selected
 * @param style - Optional custom styles for the dropdown header and options container
 * @param primaryColor - Optional color for highlighting the selected option (default: "#6200ee")
 */
const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  style,
  primaryColor = "#6200ee",
}) => {
  // State and ref for dropdown animation
  const [isOpen, setIsOpen] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  // Animate dropdown open/close
  useEffect(() => {
    Animated.timing(dropdownAnimation, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // Required for height and opacity animations
    }).start();
  }, [isOpen, dropdownAnimation]);

  /**
   * Toggles the dropdown open or closed.
   */
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  /**
   * Handles option selection and closes the dropdown.
   * @param optionValue - The value of the selected option
   */
  const selectOption = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Find the selected option's label
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={styles.container}>
      {/* Dropdown Header */}
      <TouchableOpacity
        style={[styles.dropdownHeader, style]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{label}</Text>
          <View style={styles.valueContainer}>
            <Text>{selectedOption?.label || "Select an option"}</Text>
            <FontAwesome
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={14}
              color={primaryColor}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Animated Options List */}
      <Animated.View
        style={[
          styles.optionsContainer,
          style,
          {
            opacity: dropdownAnimation,
            maxHeight: dropdownAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 200],
            }),
            transform: [
              {
                translateY: dropdownAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              },
            ],
          },
        ]}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, value === option.value && styles.selectedOption]}
            onPress={() => selectOption(option.value)}
          >
            <Text style={[styles.optionText, value === option.value && { color: primaryColor }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

// Styles for the CustomDropdown component
const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 100,
  },
  dropdownHeader: {
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelText: {
    fontSize: 16,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderRadius: 8,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor: "white",
    overflow: "hidden",
    zIndex: 101,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  selectedOption: {
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  optionText: {
    fontSize: 14,
  },
});

export default CustomDropdown;
