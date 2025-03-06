import React, { useCallback, useMemo, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import moment from "moment";
import { DailyRecord } from "@/store/userHistoryStore";

// Define props interface
interface EntriesSectionProps {
  selectedDateData: DailyRecord | null;
}

// Constants for animation and layout
const ANIMATION_DURATION = 400;
const ENTRY_HEIGHT = 60;

/**
 * EntriesSection displays a collapsible list of water intake entries for a selected date.
 * @param selectedDateData - The daily record containing water intake entries
 */
const EntriesSection: React.FC<EntriesSectionProps> = ({ selectedDateData }) => {
  // State and refs for animation
  const [isExpanded, setIsExpanded] = React.useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const expandRotateAnim = useRef(new Animated.Value(0)).current;

  // Theme hook
  const { colors } = useTheme();

  // Calculate max height based on entries
  const maxHeight = useMemo(
    () => (selectedDateData?.entries?.length ? selectedDateData.entries.length * ENTRY_HEIGHT : 0),
    [selectedDateData]
  );

  /**
   * Toggles the expansion state with parallel animations for height and rotation.
   */
  const toggleExpand = useCallback(() => {
    const newValue = !isExpanded;
    setIsExpanded(newValue);

    Animated.parallel([
      Animated.timing(expandAnim, {
        toValue: newValue ? 1 : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false, // Height animation requires non-native driver
      }),
      Animated.timing(expandRotateAnim, {
        toValue: newValue ? 1 : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true, // Rotation can use native driver
      }),
    ]).start();
  }, [isExpanded, expandAnim, expandRotateAnim]);

  return (
    <View style={[styles.detailsContainer, { backgroundColor: colors.background }]}>
      {selectedDateData?.entries?.length ? (
        <>
          {/* Expand/Collapse Button */}
          <TouchableRipple
            onPress={toggleExpand}
            style={styles.expandButton}
          >
            <View style={styles.expandButtonContent}>
              <Text
                variant="bodyLarge"
                style={styles.expandButtonText}
              >
                {isExpanded ? "Hide Details" : "View Details"}
              </Text>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: expandRotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "180deg"],
                      }),
                    },
                  ],
                }}
              >
                <FontAwesome
                  name="chevron-down"
                  size={16}
                />
              </Animated.View>
            </View>
          </TouchableRipple>

          {/* Animated Entries List */}
          <Animated.View
            style={[
              styles.entriesContainer,
              {
                opacity: expandAnim,
                height: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, maxHeight],
                }),
              },
            ]}
          >
            {selectedDateData.entries.map((entry) => (
              <View
                key={entry.id}
                style={styles.entryRow}
              >
                <Text
                  variant="labelLarge"
                  style={styles.entryText}
                >
                  {entry.amount} ml
                </Text>
                <Text
                  variant="labelLarge"
                  style={styles.time}
                >
                  {moment(entry.time).format("hh:mm A")}
                </Text>
              </View>
            ))}
          </Animated.View>
        </>
      ) : (
        <Text
          variant="labelLarge"
          style={styles.noDataText}
        >
          No water entries found
        </Text>
      )}
    </View>
  );
};

// Styles for the EntriesSection component
const styles = StyleSheet.create({
  detailsContainer: {
    marginBottom: 10,
    borderRadius: 10,
  },
  expandButton: {
    borderRadius: 12,
    paddingVertical: 20,
  },
  expandButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  expandButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  entriesContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  entryText: {
    color: "#333",
  },
  time: {
    color: "#666",
  },
  noDataText: {
    textAlign: "center",
    marginVertical: 10,
  },
});

export default EntriesSection;
