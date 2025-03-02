import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { DailyRecord } from "@/store/userHistorySotre";
import CountAnimation from "../AnimatedCounter";

interface ProgressSectionProps {
  selectedDateData: DailyRecord | null;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ selectedDateData }) => {
  const theme = useTheme();
  const [percentage, setPercentage] = useState(selectedDateData?.percentage || 0);

  // Animation refs
  const progressAnim = useRef(new Animated.Value(0)).current;

  const completedAmount = useMemo(() => {
    if (!selectedDateData) return 0;
    return Math.round((selectedDateData.percentage / 100) * (selectedDateData.totalAmount || 0));
  }, [selectedDateData]);

  // Animation handlers
  const animateProgress = useCallback(
    (percentage: number) => {
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      return () => {
        progressAnim.stopAnimation();
      };
    },
    [progressAnim]
  );

  // Progress animation
  useEffect(() => {
    let cleanup;
    if (selectedDateData) {
      setPercentage(selectedDateData.percentage || 0);
      cleanup = animateProgress(selectedDateData?.percentage || 0);
    }
    return cleanup;
  }, [selectedDateData]);

  return (
    <View style={[styles.progressRowContainer, { borderColor: theme.colors.background }]}>
      <Animated.View
        style={[
          styles.fillBackground,
          {
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: theme.colors.secondary,
          },
        ]}
      />
      <View style={styles.progressRow}>
        <Text
          variant="bodyLarge"
          style={styles.percentage}
        >
          <CountAnimation to={percentage || 0} />%
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
            / {selectedDateData?.totalAmount} ml
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  date: {
    marginBottom: 5,
  },
  progressRowContainer: {
    flex: 1,
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
