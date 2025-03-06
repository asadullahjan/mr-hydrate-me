import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider as PaperProvider } from "react-native-paper";
import SignInForm from "@/app/(auth)/login";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";

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

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

// Mock expo-router for navigation testing
jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

// Mock utility function for error message formatting
jest.mock("@/utils/getErrorMessage", () => jest.fn((code) => `Error: ${code}`));

// Test suite for the SignInForm component to validate its functionality
describe("SignInForm Component", () => {
  // Clear mocks before each test to ensure isolation and consistent results
  beforeEach(() => {
    jest.clearAllMocks();
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: "test-user" } });
  });

  // Set up fake timers to handle asynchronous operations efficiently
  beforeAll(() => {
    jest.useFakeTimers();
  });

  // Restore real timers after testing to maintain system integrity
  afterAll(() => {
    jest.useRealTimers();
  });

  // Verify that the Sign In button is rendered correctly
  it("renders the Sign In button", () => {
    const { getByText } = render(
      <PaperProvider>
        <SignInForm />
      </PaperProvider>
    );
    expect(getByText("Sign In")).toBeTruthy();
  });

  // Test successful form submission and sign-in process
  it("submits the form and completes sign-in successfully", async () => {
    const { getByTestId, getByText } = render(
      <PaperProvider>
        <SignInForm />
      </PaperProvider>
    );

    // Input email and password values
    fireEvent.changeText(getByTestId("Email"), "test@example.com");
    fireEvent.changeText(getByTestId("Password"), "password123");

    // Trigger form submission
    fireEvent.press(getByText("Sign In"));

    // Wait for the sign-in process to complete and verify the call
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        "test@example.com",
        "password123"
      );
    });
  });

  // Ensure navigation to the signup screen occurs when the Sign up link is pressed
  it("navigates to the signup screen when Sign up is clicked", () => {
    const { getByText } = render(
      <PaperProvider>
        <SignInForm />
      </PaperProvider>
    );

    fireEvent.press(getByText("Sign up"));
    expect(router.replace).toHaveBeenCalledWith("/(auth)/signup");
  });

  // Validate that an error message is displayed when sign-in fails
  it("displays an error message on sign-in failure", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: "auth/wrong-password" });

    const { getByTestId, getByText } = render(
      <PaperProvider>
        <SignInForm />
      </PaperProvider>
    );

    // Enter credentials and attempt sign-in
    fireEvent.changeText(getByTestId("Email"), "test@example.com");
    fireEvent.changeText(getByTestId("Password"), "wrong");
    fireEvent.press(getByText("Sign In"));

    // Wait for the error message to appear and verify its content
    await waitFor(() => {
      expect(getByText("Error: auth/wrong-password")).toBeTruthy();
    });
  });
});
