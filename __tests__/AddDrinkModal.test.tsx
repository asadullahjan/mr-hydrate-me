import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { AddDrinkModal } from "@/components/AddDrinkModal"; // Adjust import path
import { Provider as PaperProvider, Text } from "react-native-paper";
import { useAuth } from "@/components/Auth/AuthProvider"; // Mock this
import { addWaterIntake } from "@/services/add-water-intake"; // Mock this service
import { TouchableOpacity } from "react-native";

jest.mock("expo-font", () => ({
  loadAsync: jest.fn().mockResolvedValue(true),
  isLoaded: jest.fn().mockReturnValue(true),
}));

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));

// Mock dependencies
jest.mock("@/components/Auth/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/services/add-water-intake", () => ({
  addWaterIntake: jest.fn(),
}));

// Mock component to act as a trigger
const MockTrigger = ({ onPress }: { onPress: () => void }) => (
  <MockButton
    onPress={onPress}
    testID="mock-trigger"
  />
);

describe("AddDrinkModal Component", () => {
  // Setup mock user and reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "test-user-id" },
    });
  });

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // Test rendering and basic interactions
  it("renders correctly and opens modal when trigger is pressed", () => {
    const { getByTestId, getByText } = render(
      <PaperProvider>
        <AddDrinkModal>
          <MockTrigger onPress={() => {}} />
        </AddDrinkModal>
      </PaperProvider>
    );

    // Press the trigger to open modal
    fireEvent.press(getByTestId("mock-trigger"));

    // Check modal elements are visible
    expect(getByText("Add a Drink")).toBeTruthy();
    expect(getByText("250ml")).toBeTruthy(); // Default selected amount
  });

  // Test predefined amount selection
  it("allows selecting predefined drink amounts", () => {
    const { getByText, getByTestId } = render(
      <PaperProvider>
        <AddDrinkModal>
          <MockTrigger onPress={() => {}} />
        </AddDrinkModal>
      </PaperProvider>
    );

    // Open modal
    fireEvent.press(getByTestId("mock-trigger"));

    // Select 300ml option
    fireEvent.press(getByText("300ml"));

  });

  // Test custom amount input
  it("allows entering a custom drink amount", () => {
    const { getByTestId, getByText } = render(
      <PaperProvider>
        <AddDrinkModal>
          <MockTrigger onPress={() => {}} />
        </AddDrinkModal>
      </PaperProvider>
    );

    // Open modal
    fireEvent.press(getByTestId("mock-trigger"));

    // Find and input custom amount
    const customInput = getByTestId("custom-amount-input");
    fireEvent.changeText(customInput, "500");

    // Verify input
    expect(customInput.props.value).toBe("500");
  });

  // Test successful drink addition
  it("adds drink successfully with predefined amount", async () => {
    // Mock successful addWaterIntake
    (addWaterIntake as jest.Mock).mockResolvedValue({});
    const mockOnComplete = jest.fn();

    const { getByTestId, getByText } = render(
      <PaperProvider>
        <AddDrinkModal onComplete={mockOnComplete}>
          <MockTrigger onPress={() => {}} />
        </AddDrinkModal>
      </PaperProvider>
    );

    // Open modal
    fireEvent.press(getByTestId("mock-trigger"));

    // Press confirm button
    const confirmButton = getByText("Confirm");
    fireEvent.press(confirmButton);

    // Wait for and verify successful addition
    await waitFor(() => {
      expect(addWaterIntake).toHaveBeenCalledWith({
        user: { id: "test-user-id" },
        amount: 250, // Default amount
      });
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  // Test error handling for invalid input
  it("handles error when adding invalid drink amount", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { getByTestId, getByText } = render(
      <PaperProvider>
        <AddDrinkModal>
          <MockTrigger onPress={() => {}} />
        </AddDrinkModal>
      </PaperProvider>
    );

    // Open modal
    fireEvent.press(getByTestId("mock-trigger"));

    // Input invalid custom amount
    const customInput = getByTestId("custom-amount-input");
    fireEvent.changeText(customInput, "-100");

    // Press confirm button
    const confirmButton = getByText("Confirm");
    fireEvent.press(confirmButton);

    // Wait for and verify error handling
    await waitFor(() => {
      expect(getByTestId("error-text")).toBeTruthy();
      expect(getByTestId("error-text").props.children).toBe(
        "Please enter a valid amount greater than 0"
      );
    });

    consoleErrorSpy.mockRestore();
  });
});

// Mock Button component for testing trigger
const MockButton = ({ onPress, testID }: { onPress: () => void; testID?: string }) => (
  <TouchableOpacity
    onPress={onPress}
    testID={testID}
  >
    <Text>Mock Trigger</Text>
  </TouchableOpacity>
);
