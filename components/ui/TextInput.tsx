import React from "react";
import { TextInput as PaperTextInput, TextInputProps, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";

// Define the props interface to include custom styles and optional TextInput props
interface InputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  customStyles?: object; // Allows passing custom styles as an object
  value?: string;
  onChangeText?: (text: string) => void;
}

export const Input = ({
  label,
  placeholder,
  customStyles,
  value,
  onChangeText,
  ...rest
}: InputProps) => {
  const theme = useTheme();
  return (
    <PaperTextInput
      label={label}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      mode="outlined"
      style={[styles.defaultInput, customStyles]}
      outlineColor={theme.colors.primary}
      activeOutlineColor={theme.colors.primary}
      theme={{ colors: { background: "white" }, roundness: 3 }}
      {...rest}
    />
  );
};

// Default styles
const styles = StyleSheet.create({
  defaultInput: {
    fontSize: 16,
  },
});

export default Input;
