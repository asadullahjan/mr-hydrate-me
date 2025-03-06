import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { DailyRecord } from "@/store/userHistoryStore";
import CountAnimation from "../AnimatedCounter";

// Define props interface
interface ProgressSectionProps {
  selectedDateData: DailyRecord | null;
}

/**
 * ProgressSection displays an animated progress bar and water intake details for a selected date.
 * @param selectedDateData - The daily record containing progress data
 */
const ProgressSection: React.FC<ProgressSectionProps> = ({ selectedDateData }) => {
  // Hooks for theme
  const { colors } = useTheme();

  // Animation ref for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Memoized calculations
  const percentage = useMemo(() => selectedDateData?.percentage || 0, [selectedDateData]);
  const completedAmount = useMemo(
    () =>
      selectedDateData ? Math.round((percentage / 100) * (selectedDateData.totalAmount || 0)) : 0,
    [selectedDateData, percentage]
  );

  /**
   * Animates the progress bar to the given percentage.
   * @param toValue - The target percentage value
   */
  const animateProgress = useCallback(
    (toValue: number) => {
      Animated.timing(progressAnim, {
        toValue,
        duration: 1000,
        useNativeDriver: false, // Width animation requires non-native driver
      }).start();
    },
    [progressAnim]
  );

  // Trigger animation when selectedDateData changes
  useEffect(() => {
    animateProgress(percentage);
  }, [percentage, animateProgress]);

  return (
    <View style={[styles.progressRowContainer, { borderColor: colors.background }]}>
      {/* Animated Progress Bar Background */}
      <Animated.View
        style={[
          styles.fillBackground,
          {
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: colors.secondary,
          },
        ]}
      />

      {/* Progress Details */}
      <View style={styles.progressRow}>
        <Text
          variant="bodyLarge"
          style={styles.percentage}
        >
          <CountAnimation to={percentage} />%
        </Text>
        <View style={styles.amountContainer}>
          <Text
            variant="bodyLarge"
            style={styles.completedAmount}
          >
            {completedAmount} ml
          </Text>
          <Text
            variant="bodyLarge"
            style={styles.goal}
          >
            / {selectedDateData?.totalAmount || 0} ml
          </Text>
        </View>
      </View>
    </View>
  );
};

// Styles for the ProgressSection component
const styles = StyleSheet.create({
  progressRowContainer: {
    flex: 1,
    maxHeight: 60,
    overflow: "hidden",
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  fillBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    paddingVertical: 15,
  },
  percentage: {
    fontWeight: "bold",
    fontSize: 18,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  completedAmount: {
    fontWeight: "bold",
  },
  goal: {
    color: "#666",
  },
});

export default ProgressSection;
