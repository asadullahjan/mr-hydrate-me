import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import SignInForm from "@/app/(auth)/login"; // Adjust path if needed
import { Provider as PaperProvider } from "react-native-paper";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";

jest.mock("expo-font", () => ({
  loadAsync: jest.fn().mockResolvedValue(true),
  isLoaded: jest.fn().mockReturnValue(true),
}));

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));

// Mock Firebase entirely
jest.mock("@/firebaseConfig", () => ({
  auth: {}, // Stub auth object
}));

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(), // Mock the function
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

// Mock getErrorMessage
jest.mock("@/utils/getErrorMessage", () => jest.fn((code) => `Error: ${code}`));

describe("<SignInForm />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: "test-user" } });
  });

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("renders Sign In button", () => {
    const { getByText } = render(
      <PaperProvider>
        <SignInForm />
      </PaperProvider>
    );
    expect(getByText("Sign In")).toBeTruthy();
  });

  test("submits form and signs in successfully", async () => {
    const { getByLabelText, getByText, getByTestId } = render(
      <PaperProvider>
        <SignInForm />
      </PaperProvider>
    );
    fireEvent.changeText(getByTestId("Email"), "test@example.com");
    fireEvent.changeText(getByTestId("Password"), "password123");
    fireEvent.press(getByText("Sign In"));
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        "test@example.com",
        "password123"
      );
    });
  });

  test("navigates to signup when Sign up is pressed", () => {
    const { getByText } = render(
      <PaperProvider>
        <SignInForm />
      </PaperProvider>
    );
    fireEvent.press(getByText("Sign up"));
    expect(router.replace).toHaveBeenCalledWith("/(auth)/signup");
  });

  test("displays error on sign-in failure", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: "auth/wrong-password" });
    const { getByLabelText, getByText, getByTestId } = render(
      <PaperProvider>
        <SignInForm />
      </PaperProvider>
    );
    fireEvent.changeText(getByTestId("Email"), "test@example.com");
    fireEvent.changeText(getByTestId("Password"), "wrong");
    fireEvent.press(getByText("Sign In"));
    await waitFor(() => {
      expect(getByText("Error: auth/wrong-password")).toBeTruthy();
    });
  });
});
