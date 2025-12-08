import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, spacing } from "@/constants/theme";

interface MoodBadgeProps {
  emotion: "happiness" | "sadness" | "anger" | "fear";
  value: number; // 0-1
  size?: "small" | "medium" | "large";
}

/**
 * MoodBadge Component
 *
 * Displays a single emotion level with color-coded visual representation.
 * Used to show individual emotion metrics from mood metadata.
 */
const MoodBadge: React.FC<MoodBadgeProps> = ({
  emotion,
  value,
  size = "medium",
}) => {
  const emotionColor = colors.emotion[emotion];
  const emotionLabel = emotion.charAt(0).toUpperCase() + emotion.slice(1);
  const percentage = Math.round(value * 100);

  const containerStyle = [
    styles.container,
    size === "small" && styles.containerSmall,
    size === "large" && styles.containerLarge,
  ];

  const labelStyle = [
    styles.label,
    size === "small" && styles.labelSmall,
    size === "large" && styles.labelLarge,
  ];

  const valueStyle = [
    styles.value,
    size === "small" && styles.valueSmall,
    size === "large" && styles.valueLarge,
  ];

  return (
    <View style={containerStyle}>
      <View
        style={[
          styles.colorIndicator,
          { backgroundColor: emotionColor },
          size === "small" && styles.colorIndicatorSmall,
          size === "large" && styles.colorIndicatorLarge,
        ]}
      />
      <View style={styles.textContainer}>
        <Text style={labelStyle}>{emotionLabel}</Text>
        <Text style={valueStyle}>{percentage}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
  },
  containerSmall: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: 8,
  },
  containerLarge: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 16,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing[2],
  },
  colorIndicatorSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[1],
  },
  colorIndicatorLarge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing[3],
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  labelSmall: {
    fontSize: typography.fontSize.xs,
  },
  labelLarge: {
    fontSize: typography.fontSize.base,
  },
  value: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  valueSmall: {
    fontSize: typography.fontSize.xs,
  },
  valueLarge: {
    fontSize: typography.fontSize.base,
  },
});

export default MoodBadge;
