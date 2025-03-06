import React from "react";
import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { useAuth } from "@/components/Auth/AuthProvider";
import Index from "@/app/index";
import { PaperProvider } from "react-native-paper";

// Mock external dependencies
jest.mock("expo-router");
jest.mock("@/components/Auth/AuthProvider", () => ({
  useAuth: jest.fn(),
}));
jest.mock("react-native-paper", () => ({
  ...jest.requireActual("react-native-paper"),
  ActivityIndicator: jest.fn().mockReturnValue(null),
}));

describe("<Index />", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading indicator when authentication is in progress", () => {
    // Mock loading state
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    const { getByTestId } = render(
      <PaperProvider>
        <Index />
      </PaperProvider>
    );

    // Verify ActivityIndicator is rendered
    expect(ActivityIndicator).toHaveBeenCalledWith(
      expect.objectContaining({
        style: { margin: "auto" },
      }),
      {}
    );
  });

  it("redirects to login when user is not defined", () => {
    // Mock no user
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <PaperProvider>
        <Index />
      </PaperProvider>
    );

    // Verify Redirect to login
    expect(Redirect).toHaveBeenCalledWith(expect.objectContaining({ href: "/(auth)/login" }), {});
  });

  it("redirects to onboarding when onboarding is not completed", () => {
    // Mock user without completed onboarding
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

    // Verify Redirect to onboarding
    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(onboarding)/welcome" }),
      {}
    );
  });

  it("redirects to home when user is defined and onboarded", () => {
    // Mock fully onboarded user
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

    // Verify Redirect to home
    expect(Redirect).toHaveBeenCalledWith(expect.objectContaining({ href: "/(tabs)/home" }), {});
  });
});
