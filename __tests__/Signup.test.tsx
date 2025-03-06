import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import SignUpForm from "@/app/(auth)/signup";

// Mock Expo font utilities to prevent test failures due to font loading
jest.mock("expo-font", () => ({
  loadAsync: jest.fn().mockResolvedValue(true),
  isLoaded: jest.fn().mockReturnValue(true),
}));

// Mock vector icons to avoid rendering issues in the test environment
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));

// Mock Firebase configuration and authentication methods
jest.mock("@/firebaseConfig", () => ({
  auth: {}, // Minimal stub for auth object
}));

jest.mock("firebase/firestore", () => ({
  setDoc: jest.fn().mockResolvedValue(true),
  doc: jest.fn(() => "mocked-doc-reference"),
  collection: jest.fn(() => "mocked-collection-reference"),
  addDoc: jest.fn().mockResolvedValue({ id: "mocked-doc-id" }),
}));

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

// Mock expo-router for navigation testing
jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

// Mock utility function for error message formatting
jest.mock("@/utils/getErrorMessage", () => jest.fn((code) => `Error: ${code}`));

// Test suite for the SignUpForm component
describe("SignUpForm Component", () => {
  // Clear mocks before each test to ensure isolation and consistent results
  beforeEach(() => {
    jest.clearAllMocks();
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: "new-user" } });
  });

  // Set up fake timers to handle asynchronous operations efficiently
  beforeAll(() => {
    jest.useFakeTimers();
  });

  // Restore real timers after testing to maintain system integrity
  afterAll(() => {
    jest.useRealTimers();
  });

  // Verify that the Create Account button is rendered correctly
  it("renders the Create Account button", () => {
    const { getByText } = render(
      <PaperProvider>
        <SignUpForm />
      </PaperProvider>
    );
    expect(getByText("Create Account")).toBeTruthy();
  });

  // Test successful form submission and sign-up process
  it("submits the form and completes sign-up successfully", async () => {
    const { getByTestId, getByText } = render(
      <PaperProvider>
        <SignUpForm />
      </PaperProvider>
    );

    // Input email and password values
    fireEvent.changeText(getByTestId("Email"), "newuser@example.com");
    fireEvent.changeText(getByTestId("Password"), "password123");

    // Trigger form submission
    fireEvent.press(getByText("Create Account"));

    // Wait for the sign-up process to complete and verify the call
    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        "newuser@example.com",
        "password123"
      );
    });
  });

  // Ensure navigation to the login screen occurs when the Sign in here link is pressed
  it("navigates to the login screen when Sign in here is clicked", () => {
    const { getByText } = render(
      <PaperProvider>
        <SignUpForm />
      </PaperProvider>
    );

    fireEvent.press(getByText("Sign in here"));
    expect(router.replace).toHaveBeenCalledWith("/(auth)/login");
  });

  // Validate that an error message is displayed when sign-up fails
  it("displays an error message on sign-up failure", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
      code: "auth/email-already-in-use",
    });

    const { getByTestId, getByText } = render(
      <PaperProvider>
        <SignUpForm />
      </PaperProvider>
    );

    // Enter credentials and attempt sign-up
    fireEvent.changeText(getByTestId("Email"), "existing@example.com");
    fireEvent.changeText(getByTestId("Password"), "password123");
    fireEvent.press(getByText("Create Account"));

    // Wait for the error message to appear and verify its content
    await waitFor(() => {
      expect(getByText("Error: auth/email-already-in-use")).toBeTruthy();
    });
  });
});
