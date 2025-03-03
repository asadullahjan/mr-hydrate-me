import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, ViewStyle } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
  primaryColor?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  style,
  primaryColor = "#6200ee",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(dropdownAnimation, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectOption = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Find the selected option's label
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.dropdownHeader, style]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <View style={styles.labelContainer}>
          <Text>{label}</Text>
          <View style={styles.valueContainer}>
            <Text>{selectedOption?.label}</Text>
            <FontAwesome
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={14}
              style={styles.dropdownIcon}
            />
          </View>
        </View>
      </TouchableOpacity>

      {isOpen && (
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
              style={[
                styles.option,
                value === option.value && { backgroundColor: "rgba(0,0,0,0.03)" },
              ]}
              onPress={() => selectOption(option.value)}
            >
              <Text style={value === option.value ? { color: primaryColor } : {}}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
};

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
    width: "100%",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownIcon: {
    marginLeft: 4,
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
    overflow: "hidden",
    zIndex: 101,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
});

export default CustomDropdown;
