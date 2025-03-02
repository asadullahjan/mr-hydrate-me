import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";

interface CountAnimationProps {
  to: number; // Target value to animate to
  duration?: number; // Duration in milliseconds (default: 1000ms)
  style?: object; // Optional custom text style
  unit?: string; // Optional unit (e.g., "%", "ml")
}

const CountAnimation: React.FC<CountAnimationProps> = ({ to, duration = 1000, style, unit }) => {
  const animatedValue = useRef(new Animated.Value(to)).current;
  const prevValueRef = useRef(to); // Store the previous value of `to`
  const [displayValue, setDisplayValue] = useState(to); // State to hold the current animated value

  useEffect(() => {
    const from = prevValueRef.current; // Use the previous value as the starting point
    animatedValue.setValue(from || 0); // Reset the animation to the previous value

    // Add a listener to update the display value during animation
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value)); // Round to avoid floating-point jitter
    });

    Animated.timing(animatedValue, {
      toValue: to,
      duration,
      useNativeDriver: true, // Required since we’re driving a text value
    }).start();

    // Update the previous value after the animation starts
    prevValueRef.current = to;

    // Cleanup the listener on unmount or when `to` changes
    return () => {
      animatedValue.removeListener(listener);
    };
  }, [to, duration]);

  return (
    <>
      {displayValue}
      {unit ? ` ${unit}` : ""}
    </>
  );
};

export default CountAnimation;
