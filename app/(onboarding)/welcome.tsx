import { useAuth } from "@/components/Auth/AuthProvider";
import { auth, db } from "@/firebaseConfig";
import { updateUserData } from "@/services/update-user-profile";
import { router, useNavigation } from "expo-router";
import { setDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { TextInput, Text, Button, RadioButton, ProgressBar, Surface } from "react-native-paper";

const OnBoarding = () => {
  const totalSteps = questions.length;
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const { refreshUser } = useAuth();

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: questions[step].type === "number" ? (value ? Number(value) : "") : value,
    }));
    setError(""); // Clear error on change
  };

  const handleNext = async () => {
    const currentQuestion = questions[step];

    if (!currentQuestion.validate(formData[currentQuestion.field])) {
      setError("Please enter a valid value.");
      return;
    }

    if (step < totalSteps - 1) {
      setStep(step + 1);
      return;
    }

    // Save to Firebase when last step is reached
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);

    try {
      await updateUserData(user.uid, {
        profile: formData,
        generalData: { onBoardingCompleted: true },
      });
      await refreshUser();
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      Alert.alert("Error", e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault(); // Disable back button
    });
  }, []);

  const currentQuestion = questions[step];

  return (
    <View style={{ flex: 1, backgroundColor: "white", padding: 16 }}>
      {/* Progress Bar */}
      <ProgressBar
        progress={(step + 1) / totalSteps}
        style={{ marginBottom: 24 }}
      />

      {/* Step Counter */}
      <Text
        variant="bodyLarge"
        style={{ marginBottom: 24, color: "gray" }}
      >
        Step {step + 1} of {totalSteps}
      </Text>

      {/* Question */}
      <Text
        variant="headlineMedium"
        style={{ marginBottom: 15 }}
      >
        {currentQuestion.question}
      </Text>

      {/* Input Field */}
      {currentQuestion.type === "text" || currentQuestion.type === "number" ? (
        <TextInput
          mode="outlined"
          keyboardType={currentQuestion.type === "number" ? "numeric" : "default"}
          value={formData[currentQuestion.field] || ""}
          onChangeText={(text) => updateFormData(currentQuestion.field, text)}
          placeholder={currentQuestion.placeholder}
        />
      ) : currentQuestion.type === "radio" ? (
        <RadioButton.Group
          onValueChange={(value) => updateFormData(currentQuestion.field, value)}
          value={formData[currentQuestion.field] || ""}
        >
          {currentQuestion.options?.map((option) => (
            <Surface
              key={option.id}
              elevation={1}
              style={{ marginBottom: 8, borderRadius: 8 }}
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
      {error ? <Text style={{ color: "red", marginTop: 8 }}>{error}</Text> : null}

      {/* Navigation Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: 16,
        }}
      >
        <Button
          mode="contained"
          onPress={handleBack}
          disabled={step === 0}
          style={{ flex: 1, marginRight: 8 }}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          loading={loading}
          disabled={loading}
          style={{ flex: 1, marginLeft: 8 }}
        >
          {step === totalSteps - 1 ? "Finish" : "Next"}
        </Button>
      </View>
    </View>
  );
};

export default OnBoarding;

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
