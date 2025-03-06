import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, StyleProp, TextStyle } from "react-native";

// Define props interface
interface CountAnimationProps {
  to: number; // Target value to animate to
  duration?: number; // Duration in milliseconds (default: 1000ms)
  style?: StyleProp<TextStyle>; // Optional custom text style
  unit?: string; // Optional unit (e.g., "%", "ml")
}

/**
 * CountAnimation animates a numeric value from its previous value to a target value.
 * @param to - The target number to animate to
 * @param duration - Animation duration in milliseconds (default: 1000)
 * @param style - Optional custom text style
 * @param unit - Optional unit to append (e.g., "%", "ml")
 */
const CountAnimation: React.FC<CountAnimationProps> = ({ to, duration = 1000, style, unit }) => {
  // Refs and state for animation
  const animatedValue = useRef(new Animated.Value(to)).current;
  const prevValueRef = useRef(to);
  const [displayValue, setDisplayValue] = useState(to);

  // Animate the value when `to` or `duration` changes
  useEffect(() => {
    const from = prevValueRef.current; // Start from the previous value
    animatedValue.setValue(from); // Reset to previous value

    // Listener to update display value during animation
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value)); // Round to nearest integer
    });

    // Start animation
    Animated.timing(animatedValue, {
      toValue: to,
      duration,
      useNativeDriver: true,
    }).start();

    // Update previous value after animation starts
    prevValueRef.current = to;

    // Cleanup listener on unmount or change
    return () => animatedValue.removeListener(listener);
  }, [to, duration, animatedValue]);

  return (
    <Text style={style}>
      {displayValue}
      {unit && ` ${unit}`}
    </Text>
  );
};

// No styles needed since this component uses passed-in styles
const styles = StyleSheet.create({});

export default CountAnimation;
