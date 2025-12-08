import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { colors, typography, spacing } from "@/constants/theme";
import { EmotionRange } from "@/types/filter.types";

interface EmotionSliderProps {
  emotion: "happiness" | "fear" | "sadness" | "anger";
  range: EmotionRange;
  onRangeChange: (range: EmotionRange) => void;
}

/**
 * EmotionSlider Component
 *
 * Allows users to filter journal entries by selecting an emotion range (0-1).
 * Displays dual sliders for min and max values with color-coded emotion indicator.
 */
const EmotionSlider: React.FC<EmotionSliderProps> = ({
  emotion,
  range,
  onRangeChange,
}) => {
  const emotionColor = colors.emotion[emotion];
  const emotionLabel = emotion.charAt(0).toUpperCase() + emotion.slice(1);

  const handleMinChange = (value: number) => {
    // Ensure min doesn't exceed max
    const newMin = Math.min(value, range.max);
    onRangeChange({ min: newMin, max: range.max });
  };

  const handleMaxChange = (value: number) => {
    // Ensure max doesn't go below min
    const newMax = Math.max(value, range.min);
    onRangeChange({ min: range.min, max: newMax });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <View
            style={[styles.colorIndicator, { backgroundColor: emotionColor }]}
          />
          <Text style={styles.label}>{emotionLabel}</Text>
        </View>
        <Text style={styles.rangeText}>
          {Math.round(range.min * 100)}% - {Math.round(range.max * 100)}%
        </Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Min</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={range.min}
          onValueChange={handleMinChange}
          minimumTrackTintColor={emotionColor}
          maximumTrackTintColor={colors.neutral[200]}
          thumbTintColor={emotionColor}
        />
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Max</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={range.max}
          onValueChange={handleMaxChange}
          minimumTrackTintColor={emotionColor}
          maximumTrackTintColor={colors.neutral[200]}
          thumbTintColor={emotionColor}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: spacing[3],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing[2],
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  rangeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing[2],
  },
  sliderLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    width: 40,
    marginRight: spacing[2],
  },
  slider: {
    flex: 1,
    height: 40,
  },
});

export default EmotionSlider;
