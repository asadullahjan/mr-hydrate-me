import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider as PaperProvider, Text } from "react-native-paper";
import { AddDrinkModal } from "@/components/AddDrinkModal";
import { useAuth } from "@/components/Auth/AuthProvider";
import { addWaterIntake } from "@/services/add-water-intake";
import { TouchableOpacity } from "react-native";

// Mocking Expo font utilities to ensure tests run smoothly without font loading issues
jest.mock("expo-font", () => ({
  loadAsync: jest.fn().mockResolvedValue(true),
  isLoaded: jest.fn().mockReturnValue(true),
}));

// Mocking vector icons to avoid rendering issues in the test environment
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));

// Mocking the authentication context to simulate user data
jest.mock("@/components/Auth/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mocking the water intake service to control its behavior during tests
jest.mock("@/services/add-water-intake", () => ({
  addWaterIntake: jest.fn(),
}));

// A reusable mock trigger component to simulate opening the modal
const MockTrigger = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    testID="mock-trigger"
  >
    <Text>Trigger Modal</Text>
  </TouchableOpacity>
);

// Test suite for the AddDrinkModal component, ensuring core functionality is verified
describe("AddDrinkModal Component", () => {
  // Reset mocks before each test to maintain isolation and prevent state leakage
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "test-user-id" },
    });
  });

  // Enable fake timers globally to handle asynchronous operations efficiently
  beforeAll(() => {
    jest.useFakeTimers();
  });

  // Restore real timers after all tests to avoid interfering with other suites
  afterAll(() => {
    jest.useRealTimers();
  });

  // Verify that the modal renders and opens correctly when triggered
  it("renders properly and displays when the trigger is activated", () => {
    const { getByTestId, getByText } = render(
      <PaperProvider>
        <AddDrinkModal>
          <MockTrigger onPress={() => {}} />
        </AddDrinkModal>
      </PaperProvider>
    );

    fireEvent.press(getByTestId("mock-trigger"));
    expect(getByText("Add a Drink")).toBeTruthy();
    expect(getByText("250ml")).toBeTruthy(); // Default amount should be visible
  });

  // Test the ability to select predefined drink amounts
  it("supports selection of predefined drink amounts", () => {
    const { getByTestId, getByText } = render(
      <PaperProvider>
        <AddDrinkModal>
          <MockTrigger onPress={() => {}} />
        </AddDrinkModal>
      </PaperProvider>
    );

    fireEvent.press(getByTestId("mock-trigger"));
    fireEvent.press(getByText("300ml"));

    // Verify the selected amount updates to 300ml
    expect(getByTestId("selected-amount")).toHaveTextContent("300ml");
  });

  // Ensure custom drink amount input functions as expected
  it("accepts custom drink amount input", () => {
    const { getByTestId } = render(
      <PaperProvider>
        <AddDrinkModal>
          <MockTrigger onPress={() => {}} />
        </AddDrinkModal>
      </PaperProvider>
    );

    fireEvent.press(getByTestId("mock-trigger"));
    const customInput = getByTestId("custom-amount-input");
    fireEvent.changeText(customInput, "500");
    expect(customInput.props.value).toBe("500");
  });

  // Confirm successful addition of a drink with a predefined amount
  it("successfully adds a drink with a predefined amount and invokes onComplete", async () => {
    (addWaterIntake as jest.Mock).mockResolvedValue({});
    const mockOnComplete = jest.fn();

    const { getByTestId, getByText } = render(
      <PaperProvider>
        <AddDrinkModal onComplete={mockOnComplete}>
          <MockTrigger onPress={() => {}} />
        </AddDrinkModal>
      </PaperProvider>
    );

    fireEvent.press(getByTestId("mock-trigger"));
    fireEvent.press(getByText("Confirm"));

    await waitFor(() => {
      expect(addWaterIntake).toHaveBeenCalledWith({
        user: { id: "test-user-id" },
        amount: 250, // Default amount
      });
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  // Validate error handling for invalid drink amounts
  it("displays an error message for an invalid drink amount", async () => {
    const { getByTestId, getByText } = render(
      <PaperProvider>
        <AddDrinkModal>
          <MockTrigger onPress={() => {}} />
        </AddDrinkModal>
      </PaperProvider>
    );

    fireEvent.press(getByTestId("mock-trigger"));
    const customInput = getByTestId("custom-amount-input");
    fireEvent.changeText(customInput, "-100");
    fireEvent.press(getByText("Confirm"));

    await waitFor(() => {
      expect(getByTestId("error-text")).toBeTruthy();
      expect(getByTestId("error-text").props.children).toBe(
        "Please enter a valid amount greater than 0"
      );
    });
  });
});
