import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import PasswordResetForm from "@/app/(auth)/restPassword";

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
  sendPasswordResetEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

// Mock expo-router for navigation testing
jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

// Mock utility function for error message formatting
jest.mock("@/utils/getErrorMessage", () => jest.fn((code) => `Error: ${code}`));

// Test suite for the PasswordResetForm component
describe("PasswordResetForm Component", () => {
  // Clear mocks before each test to ensure isolation and consistent results
  beforeEach(() => {
    jest.clearAllMocks();
    (sendPasswordResetEmail as jest.Mock).mockResolvedValue(true);
  });

  // Set up fake timers to handle asynchronous operations efficiently
  beforeAll(() => {
    jest.useFakeTimers();
  });

  // Restore real timers after testing to maintain system integrity
  afterAll(() => {
    jest.useRealTimers();
  });

  // Verify that the Send Reset Email button is rendered correctly
  it("renders the Send Reset Email button", () => {
    const { getByText } = render(
      <PaperProvider>
        <PasswordResetForm />
      </PaperProvider>
    );
    expect(getByText("Send Reset Email")).toBeTruthy();
  });

  // Test successful form submission and password reset process
  it("submits the form and sends reset email successfully", async () => {
    const { getByTestId, getByText } = render(
      <PaperProvider>
        <PasswordResetForm />
      </PaperProvider>
    );

    // Input email value
    fireEvent.changeText(getByTestId("Email"), "reset@example.com");

    // Trigger form submission
    fireEvent.press(getByText("Send Reset Email"));

    // Wait for the reset process to complete and verify the call
    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith({}, "reset@example.com");
    });

    // Verify success message appears
    await waitFor(() => {
      expect(getByText("Password reset email sent. Check your inbox.")).toBeTruthy();
    });
  });

  // Ensure navigation to the login screen occurs when the Login here link is pressed
  it("navigates to the login screen when Login here is clicked", () => {
    const { getByText } = render(
      <PaperProvider>
        <PasswordResetForm />
      </PaperProvider>
    );

    fireEvent.press(getByText("Login here"));
    expect(router.replace).toHaveBeenCalledWith("/(auth)/login");
  });

  // Validate that an error message is displayed when password reset fails
  it("displays an error message on reset failure", async () => {
    (sendPasswordResetEmail as jest.Mock).mockRejectedValue({ code: "auth/user-not-found" });

    const { getByTestId, getByText } = render(
      <PaperProvider>
        <PasswordResetForm />
      </PaperProvider>
    );

    // Enter email and attempt reset
    fireEvent.changeText(getByTestId("Email"), "nonexistent@example.com");
    fireEvent.press(getByText("Send Reset Email"));

    // Wait for the error message to appear and verify its content
    await waitFor(() => {
      expect(getByText("Error: auth/user-not-found")).toBeTruthy();
    });
  });

  // Validate email format checking
  it("validates email format before submission", async () => {
    const { getByTestId, getByText } = render(
      <PaperProvider>
        <PasswordResetForm />
      </PaperProvider>
    );

    // Enter invalid email
    fireEvent.changeText(getByTestId("Email"), "invalid-email");
    fireEvent.press(getByText("Send Reset Email"));

    // Verify validation error appears
    await waitFor(() => {
      expect(getByText("Invalid email address")).toBeTruthy();
    });

    // Confirm reset email was not sent
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });
});
