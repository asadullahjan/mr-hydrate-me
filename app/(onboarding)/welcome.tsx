import { useAuth } from "@/components/Auth/AuthProvider";
import { auth } from "@/firebaseConfig";
import { updateUserData } from "@/services/update-user-profile";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, View, StyleSheet } from "react-native";
import { TextInput, Text, Button, RadioButton, ProgressBar, Surface } from "react-native-paper";

// Define the shape of a question
interface Question {
  field: string;
  question: string;
  type: "text" | "number" | "radio";
  placeholder?: string;
  options?: { id: string; label: string; description?: string }[];
  validate: (value: string) => boolean;
}

// List of onboarding questions
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
 * OnBoarding component guides users through a multi-step form to collect profile data.
 * Data is saved to Firebase upon completion.
 */
const OnBoarding = () => {
  const totalSteps = questions.length;
  // Current step in the onboarding process
  const [step, setStep] = useState(0);
  // Form data collected from user input
  const [formData, setFormData] = useState<{ [key: string]: string | number }>({});
  // Loading state during data submission
  const [loading, setLoading] = useState(false);
  // Error message for validation or submission errors
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const { refreshUser } = useAuth();

  // Prevent navigation away from onboarding
  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault(); // Disable back button
    });
  }, [navigation]);

  /**
   * Updates form data for the current question.
   * @param field - The question's field name
   * @param value - The user's input value
   */
  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: questions[step].type === "number" ? (value ? Number(value) : "") : value,
    }));
    setError(""); // Clear error on input change
  };

  /**
   * Handles navigation to the next step or submits data on the final step.
   */
  const handleNext = async () => {
    const currentQuestion = questions[step];

    if (!currentQuestion.validate(formData[currentQuestion.field]?.toString() || "")) {
      setError("Please enter a valid value.");
      return;
    }

    if (step < totalSteps - 1) {
      setStep(step + 1);
      return;
    }

    // Submit data on the final step
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      await updateUserData(user.uid, {
        profile: formData,
        generalData: { onBoardingCompleted: true },
      });
      await refreshUser();
      router.replace("/(tabs)/home"); // Redirect to main app after completion
    } catch (error: any) {
      console.error("Error saving onboarding data:", error);
      Alert.alert("Error", error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles navigation to the previous step.
   */
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const currentQuestion = questions[step];

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <ProgressBar
        progress={(step + 1) / totalSteps}
        style={styles.progressBar}
      />

      {/* Step Counter */}
      <Text
        variant="bodyLarge"
        style={styles.stepCounter}
      >
        Step {step + 1} of {totalSteps}
      </Text>

      {/* Question */}
      <Text
        variant="headlineMedium"
        style={styles.question}
      >
        {currentQuestion.question}
      </Text>

      {/* Input Field */}
      {currentQuestion.type === "text" || currentQuestion.type === "number" ? (
        <TextInput
          mode="outlined"
          keyboardType={currentQuestion.type === "number" ? "numeric" : "default"}
          value={formData[currentQuestion.field]?.toString() || ""}
          onChangeText={(text) => updateFormData(currentQuestion.field, text)}
          placeholder={currentQuestion.placeholder}
          style={styles.input}
        />
      ) : currentQuestion.type === "radio" ? (
        <RadioButton.Group
          onValueChange={(value) => updateFormData(currentQuestion.field, value)}
          value={formData[currentQuestion.field]?.toString() || ""}
        >
          {currentQuestion.options?.map((option) => (
            <Surface
              key={option.id}
              elevation={1}
              style={styles.radioOption}
            >
              <RadioButton.Item
                label={option.label}
                value={option.id}
              />
            </Surface>
          ))}
        </RadioButton.Group>
      ) : null}

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleBack}
          disabled={step === 0}
          style={styles.button}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          {step === totalSteps - 1 ? "Finish" : "Next"}
        </Button>
      </View>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  progressBar: {
    marginBottom: 24,
  },
  stepCounter: {
    marginBottom: 24,
    color: "gray",
  },
  question: {
    marginBottom: 15,
  },
  input: {
    marginBottom: 8,
  },
  radioOption: {
    marginBottom: 8,
    borderRadius: 8,
  },
  errorText: {
    color: "red",
    marginTop: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default OnBoarding;
