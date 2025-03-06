import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  HelperText,
  useTheme,
  Surface,
} from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/components/Auth/AuthProvider";
import { updateUserData } from "@/services/update-user-profile";

// Define ActivityLevel and Gender types
type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extreme";
type Gender = "male" | "female" | "other" | "preferNotToSay";

// Questions array
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
  const { user } = useAuth();
  const { userId } = useLocalSearchParams();

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
    activity: "sedentary",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

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
        },
      };

      const userIdToUse = user?.uid || (userId as string);
      if (!userIdToUse) throw new Error("No user ID available");

      const result = await updateUserData(userIdToUse, userData);
      console.log("User data updated successfully:", result);
      router.back();
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
            <Text variant="bodyLarge">{question.question}</Text>
            {question.type === "text" || question.type === "number" ? (
              <>
                <TextInput
                  mode="outlined"
                  placeholder={question.placeholder}
                  value={formData[question.field as keyof typeof formData]}
                  onChangeText={(value) => handleChange(question.field, value)}
                  keyboardType={question.type === "number" ? "numeric" : "default"}
                  style={styles.input}
                  error={!!errors[question.field]}
                  outlineColor={theme.colors.primary}
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
                value={formData.activity || "sedentary"}
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

        {errors.general && (
          <HelperText
            type="error"
            visible={!!errors.general}
          >
            {errors.general}
          </HelperText>
        )}

        <View style={{ flexDirection: "row", gap: 5 }}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            labelStyle={{ color: theme.colors.primary }}
          >
            cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            labelStyle={{ color: theme.colors.onPrimary }}
          >
            Save
          </Button>
        </View>
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
    backgroundColor: "white",
  },
  radioSurface: {
    marginVertical: 6,
    borderRadius: 8,
  },
  radioDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  button: {
    flex: 1,
  },
});
