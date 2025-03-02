import React, { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import * as d3 from "d3-shape";
import { useTheme, Text } from "react-native-paper";

export const ArcProgress = ({
  progress,
  size = 400,
  strokeWidth = 40,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const roundness = 15;
  const theme = useTheme();
  const animation = useRef(new Animated.Value(0)).current;
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate the progress value
  useEffect(() => {
    const listener = animation.addListener(({ value }) => {
      setAnimatedProgress(value); // Update state with current animated value
    });

    Animated.timing(animation, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    return () => {
      animation.removeListener(listener); // Cleanup listener
    };
  }, [progress]);

  // Convert progress percentage (0-100) to radians (0 to π)
  const startAngle = -Math.PI / 1.3; // 180 degrees (bottom left)
  const totalSpan = (Math.PI / 1.3) * 2; // Total arc span (twice the start angle magnitude, ~276.92°)
  const endAngle = startAngle + (animatedProgress / 100) * totalSpan; // Dynamic based on progress

  // Create arc path using d3-shape
  const arcGenerator = d3
    .arc()
    .innerRadius(radius - strokeWidth)
    .outerRadius(radius)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .cornerRadius(roundness); // Smooth edges

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg
        width={size}
        height={size / 2}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background Arc */}
        <Path
          // @ts-ignore
          d={d3
            .arc()
            .innerRadius(radius - strokeWidth)
            .outerRadius(radius)
            .startAngle(startAngle)
            .endAngle(-startAngle) // Full semicircle
            .cornerRadius(roundness)()}
          fill="white"
          transform={`translate(${centerX}, ${centerY})`}
        />

        {/* Progress Arc */}
        <Path
          // @ts-ignore
          d={arcGenerator()}
          fill={theme.colors.primary}
          transform={`translate(${centerX}, ${centerY})`}
        />
      </Svg>
      {/* Percentage Text */}
      <Text
        style={{
          position: "absolute",
          fontSize: 30,
          fontWeight: "bold",
          color: theme.colors.primary,
        }}
      >
        {animatedProgress.toFixed(0)}%
      </Text>
    </View>
  );
};

export default ArcProgress;
