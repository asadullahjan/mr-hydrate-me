import React from "react";
import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { useAuth } from "@/components/Auth/AuthProvider";
import Index from "@/app/index";
import { PaperProvider } from "react-native-paper";

// Mock external dependencies to isolate the component during testing
jest.mock("expo-router");

jest.mock("@/components/Auth/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    ActivityIndicator: jest.fn().mockReturnValue(null),
  };
});

// Test suite for the Index component to verify its conditional rendering logic
describe("Index Component", () => {
  // Clear all mocks before each test to ensure consistent and isolated test results
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test redirection to the login screen when no user is authenticated
  it("redirects to the login screen when no user is authenticated", () => {
    // Simulate a state with no authenticated user and loading complete
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <PaperProvider>
        <Index />
      </PaperProvider>
    );

    // Confirm that Redirect is called with the login route
    expect(Redirect).toHaveBeenCalledWith(expect.objectContaining({ href: "/(auth)/login" }), {});
  });

  // Test redirection to onboarding when the user has not completed onboarding
  it("redirects to onboarding when the user has not completed onboarding", () => {
    // Simulate a user who is authenticated but has not completed onboarding
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        uid: "test-user",
        onBoardingCompleted: false,
      },
      loading: false,
    });

    render(
      <PaperProvider>
        <Index />
      </PaperProvider>
    );

    // Confirm that Redirect is called with the onboarding route
    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(onboarding)/welcome" }),
      {}
    );
  });

  // Test redirection to the home screen for an authenticated and onboarded user
  it("redirects to the home screen when the user is authenticated and onboarded", () => {
    // Simulate a fully authenticated and onboarded user
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        uid: "test-user",
        onBoardingCompleted: true,
      },
      loading: false,
    });

    render(
      <PaperProvider>
        <Index />
      </PaperProvider>
    );

    // Confirm that Redirect is called with the home route
    expect(Redirect).toHaveBeenCalledWith(expect.objectContaining({ href: "/(tabs)/home" }), {});
  });
});
