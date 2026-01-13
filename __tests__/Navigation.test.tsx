import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { Redirect, SplashScreen } from "expo-router";
import { useAuth } from "@/components/auth/AuthProvider";
import Index from "@/app/index";
import { PaperProvider } from "react-native-paper";

// Mock external dependencies to isolate the component during testing
jest.mock("expo-router", () => ({
  Redirect: jest.fn(() => null), // Mock Redirect as a component
  SplashScreen: {
    preventAutoHideAsync: jest.fn(() => Promise.resolve()),
    hideAsync: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock("@/components/auth/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    ActivityIndicator: jest.fn(() => null),
  };
});

jest.mock("@/firebaseConfig", () => ({
  auth: {},
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
}));

// Test suite for the Index component
describe("Index Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to the login screen when no user is authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    // Mock onAuthStateChanged to resolve immediately with null user
    (require("firebase/auth").onAuthStateChanged as jest.Mock).mockImplementation(
      (auth, callback) => {
        callback(null); // No user
        return jest.fn(); // Mock unsubscribe
      }
    );

    render(
      <PaperProvider>
        <Index />
      </PaperProvider>
    );

    await waitFor(() => {
      expect(Redirect).toHaveBeenCalledWith(expect.objectContaining({ href: "/(auth)/login" }), {});
    });
  });

  it("redirects to onboarding when the user has not completed onboarding", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        uid: "test-user",
        onBoardingCompleted: false,
      },
      loading: false,
    });

    (require("firebase/auth").onAuthStateChanged as jest.Mock).mockImplementation(
      (auth, callback) => {
        callback({ uid: "test-user", onBoardingCompleted: false });
        return jest.fn();
      }
    );

    render(
      <PaperProvider>
        <Index />
      </PaperProvider>
    );

    await waitFor(() => {
      expect(Redirect).toHaveBeenCalledWith(
        expect.objectContaining({ href: "/(onboarding)/welcome" }),
        {}
      );
    });
  });

  it("redirects to the home screen when the user is authenticated and onboarded", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        uid: "test-user",
        onBoardingCompleted: true,
      },
      loading: false,
    });

    (require("firebase/auth").onAuthStateChanged as jest.Mock).mockImplementation(
      (auth, callback) => {
        callback({ uid: "test-user", onBoardingCompleted: true });
        return jest.fn();
      }
    );

    render(
      <PaperProvider>
        <Index />
      </PaperProvider>
    );

    await waitFor(() => {
      expect(Redirect).toHaveBeenCalledWith(
        expect.objectContaining({ href: "/home" }), // Match your Index.tsx
        {}
      );
    });
  });
});
