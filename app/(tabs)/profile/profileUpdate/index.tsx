import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, TextInput, Button, RadioButton, HelperText, useTheme } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/components/Auth/AuthProvider"; // Adjust path as needed
import { updateUserData } from "@/services/update-user-profile";

// Define ActivityLevel and Gender types (based on your interface)
type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extreme";
type Gender = "male" | "female" | "other" | "preferNotToSay";

// Questions array from your input
const questions = [
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

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth(); // Get the current user from AuthProvider
  const { userId } = useLocalSearchParams(); // Optional: If passing userId via params

  // State for form data
  const [formData, setFormData] = useState<{
    name: string;
    age: string;
    height: string;
    weight: string;
    activity: ActivityLevel;
  }>({
    name: "",
    age: "",
    height: "",
    weight: "",
    activity: "sedentary", // Default value for activity
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load existing user data on mount
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

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    questions.forEach((question) => {
      const value = formData[question.field as keyof typeof formData];
      if (!question.validate(value)) {
        newErrors[question.field] = `Please provide a valid ${question.field}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
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
          activity: formData.activity as ActivityLevel,
          // You can add gender here if you extend the questions array
        },
      };

      const userIdToUse = user?.uid || (userId as string); // Use authenticated user ID or passed ID
      if (!userIdToUse) throw new Error("No user ID available");

      const result = await updateUserData(userIdToUse, userData);
      console.log("User data updated successfully:", result);
      router.back(); // Navigate back to the profile or home screen
    } catch (err) {
      console.error("Error updating user data:", err);
      setErrors((prev) => ({ ...prev, general: "Failed to update profile. Please try again." }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Edit Your Profile
        </Text>

        {questions.map((question) => (
          <View
            key={question.field}
            style={styles.questionContainer}
          >
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.secondary }}
            >
              {question.question}
            </Text>
            {question.type === "text" || question.type === "number" ? (
              <>
                <TextInput
                  mode="outlined"
                  label={question.placeholder}
                  value={formData[question.field as keyof typeof formData]}
                  onChangeText={(value) => handleChange(question.field, value)}
                  keyboardType={question.type === "number" ? "numeric" : "default"}
                  style={styles.input}
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
              question.options?.map((option) => (
                <View
                  key={option.id}
                  style={styles.radioItem}
                >
                  <RadioButton
                    value={option.id}
                    status={formData.activity === option.id ? "checked" : "unchecked"}
                    onPress={() => handleChange("activity", option.id)}
                  />
                  <View>
                    <Text style={{ color: theme.colors.secondary }}>{option.label}</Text>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                      {option.description}
                    </Text>
                  </View>
                </View>
              ))
            ) : null}
          </View>
        ))}

        {errors.general && (
          <HelperText
            type="error"
            visible={!!errors.general}
          >
            {errors.general}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          labelStyle={{ color: theme.colors.onPrimary }}
        >
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
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
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
  },
});
