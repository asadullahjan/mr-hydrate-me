import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Animated, StyleSheet, FlatList, Easing } from "react-native";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import moment from "moment";
import { DailyRecord } from "@/store/userHistoryStore";

interface EntriesSectionProps {
  selectedDateData: DailyRecord | null;
}

// Constants for better maintainability
const ANIMATION_DURATION = 400;
const ENTRY_HEIGHT = 60;

export const EntriesSection: React.FC<EntriesSectionProps> = ({ selectedDateData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const expandRotateAnim = useRef(new Animated.Value(0)).current;
  const theme = useTheme();

  const maxHeight = useMemo(
    () => (selectedDateData?.entries?.length ? selectedDateData.entries.length * ENTRY_HEIGHT : 0),
    [selectedDateData]
  );

  const toggleExpand = useCallback(() => {
    const newValue = !isExpanded;
    setIsExpanded(newValue);

    Animated.parallel([
      Animated.timing(expandAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(expandRotateAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [isExpanded]);

  return (
    <View style={[styles.detailsContainer, { backgroundColor: theme.colors.background }]}>
      {selectedDateData?.entries?.length ? (
        <>
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
          No Water entries found
        </Text>
      )}
    </View>
  );
};

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
