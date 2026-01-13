import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Text, Button, RadioButton, HelperText, useTheme, Surface } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/components/auth/AuthProvider";
import { updateUserData } from "@/services/update-user-profile";
import TextInput from "@/components/ui/TextInput";
import HeaderWithBack from "@/components/ui/HeaderWithBack";

// Define ActivityLevel type
type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extreme";

// Define the structure of a question
interface Question {
  field: keyof FormData;
  question: string;
  type: "text" | "number" | "radio";
  placeholder?: string;
  options?: { id: string; label: string; description: string }[];
  validate: (value: string) => boolean;
}

// Form data type
interface FormData {
  name: string;
  age: string;
  height: string;
  weight: string;
  activity: ActivityLevel;
}

// List of profile questions
const questions: Question[] = [
  {
    field: "name",
    question: "What's your name?",
    type: "text",
    placeholder: "Enter your name",
    validate: (value: string) => value.trim() !== "",
  },
  {
    field: "age",
    question: "What's your age?",
    type: "number",
    placeholder: "Enter your age",
    validate: (value: string) => !isNaN(Number(value)) && Number(value) > 0,
  },
  {
    field: "height",
    question: "What's your height?",
    type: "number",
    placeholder: "Enter height in cm",
    validate: (value: string) => !isNaN(Number(value)) && Number(value) > 0,
  },
  {
    field: "weight",
    question: "What's your weight?",
    type: "number",
    placeholder: "Enter weight in kg",
    validate: (value: string) => !isNaN(Number(value)) && Number(value) > 0,
  },
  {
    field: "activity",
    question: "How active are you?",
    type: "radio",
    options: [
      { id: "sedentary", label: "Sedentary", description: "Little to no exercise" },
      { id: "light", label: "Lightly Active", description: "1-3 days/week" },
      { id: "moderate", label: "Moderately Active", description: "3-5 days/week" },
      { id: "very", label: "Very Active", description: "6-7 days/week" },
      { id: "extreme", label: "Extremely Active", description: "Athletic/Physical job" },
    ],
    validate: (value: string) => value.trim() !== "",
  },
];

/**
 * EditProfileScreen allows users to update their profile information.
 */
const EditProfileScreen = () => {
  // Hooks for theme, routing, auth, and params
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { userId } = useLocalSearchParams();

  // State for form data, errors, and loading
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    height: "",
    weight: "",
    activity: "sedentary",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Populate form with user data on mount
  useEffect(() => {
    if (user?.profile) {
      setFormData({
        name: user.profile.name || "",
        age: user.profile.age?.toString() || "",
        height: user.profile.height?.toString() || "",
        weight: user.profile.weight?.toString() || "",
        activity: (user.profile.activity as ActivityLevel) || "sedentary",
      });
    }
  }, [user]);

  /**
   * Updates form data based on user input.
   * @param field - The field to update
   * @param value - The new value
   */
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setHasUnsavedChanges(true);
  };

  /**
   * Validates the form data and updates errors.
   * @returns True if the form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    questions.forEach((question) => {
      const value = formData[question.field];
      if (!question.validate(value)) {
        newErrors[question.field] = `Please provide a valid ${question.field}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission by updating user data and navigating back.
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userData = {
        profile: {
          name: formData.name,
          age: Number(formData.age),
          height: Number(formData.height),
          weight: Number(formData.weight),
          activity: formData.activity,
        },
      };

      const userIdToUse = user?.uid || (userId as string);
      if (!userIdToUse) throw new Error("No user ID available");

      await updateUserData(userIdToUse, userData);
      router.push("/(tabs)/profile");
    } catch (err) {
      console.error("Error updating user data:", err);
      setErrors((prev) => ({ ...prev, general: "Failed to update profile. Please try again." }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title */}
      <HeaderWithBack
        title="Edit Your Profile"
        backRoute={"/(tabs)/profile"}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Profile Questions */}
      {questions.map((question) => (
        <View
          key={question.field}
          style={styles.questionContainer}
        >
          <Text variant="bodyLarge">{question.question}</Text>
          {question.type === "text" || question.type === "number" ? (
            <>
              <TextInput
                mode="outlined"
                placeholder={question.placeholder}
                value={formData[question.field]}
                onChangeText={(value) => handleChange(question.field, value)}
                keyboardType={question.type === "number" ? "numeric" : "default"}
                customStyles={styles.input}
                error={!!errors[question.field]}
              />
              {errors[question.field] && (
                <HelperText
                  type="error"
                  visible={!!errors[question.field]}
                >
                  {errors[question.field]}
                </HelperText>
              )}
            </>
          ) : question.type === "radio" ? (
            <RadioButton.Group
              onValueChange={(value) => handleChange("activity", value)}
              value={formData.activity}
            >
              {question.options?.map((option) => (
                <Surface
                  key={option.id}
                  elevation={1}
                  style={styles.radioSurface}
                >
                  <RadioButton.Item
                    label={option.label}
                    value={option.id}
                  />
                </Surface>
              ))}
            </RadioButton.Group>
          ) : null}
        </View>
      ))}

      {/* General Error Message */}
      {errors.general && (
        <HelperText
          type="error"
          visible={!!errors.general}
          style={styles.error}
        >
          {errors.general}
        </HelperText>
      )}

      {/* Action Button */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading || !hasUnsavedChanges}
        labelStyle={{ color: colors.onPrimary }}
      >
        Save
      </Button>
    </ScrollView>
  );
};

// Styles for the EditProfileScreen component
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingVertical: 30,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  questionContainer: {
    marginBottom: 20,
  },
  input: {
    marginTop: 10,
    backgroundColor: "white",
  },
  radioSurface: {
    marginVertical: 6,
    borderRadius: 8,
  },
  error: {
    marginBottom: 10,
  },
});

export default EditProfileScreen;
