import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, spacing } from "@/constants/theme";
import { MoodMetadata } from "@/types/entry.types";
import MoodBadge from "./MoodBadge";

interface EmotionVisualizationProps {
  moodMetadata: MoodMetadata;
  variant?: "compact" | "detailed";
}

/**
 * EmotionVisualization Component
 *
 * Displays complete mood metadata with color-coded emotion display.
 * Shows all four emotion levels (happiness, fear, sadness, anger) and overall sentiment.
 */
const EmotionVisualization: React.FC<EmotionVisualizationProps> = ({
  moodMetadata,
  variant = "detailed",
}) => {
  const sentimentColor = colors.emotion[moodMetadata.sentiment];
  const sentimentLabel =
    moodMetadata.sentiment.charAt(0).toUpperCase() +
    moodMetadata.sentiment.slice(1);

  if (variant === "compact") {
    return (
      <View style={styles.compactContainer}>
        <View
          style={[styles.sentimentBadge, { backgroundColor: sentimentColor }]}
        >
          <Text style={styles.sentimentText}>{sentimentLabel}</Text>
        </View>
        <View style={styles.compactEmotions}>
          {moodMetadata.happiness > 0.3 && (
            <View
              style={[
                styles.compactDot,
                { backgroundColor: colors.emotion.happiness },
              ]}
            />
          )}
          {moodMetadata.sadness > 0.3 && (
            <View
              style={[
                styles.compactDot,
                { backgroundColor: colors.emotion.sadness },
              ]}
            />
          )}
          {moodMetadata.anger > 0.3 && (
            <View
              style={[
                styles.compactDot,
                { backgroundColor: colors.emotion.anger },
              ]}
            />
          )}
          {moodMetadata.fear > 0.3 && (
            <View
              style={[
                styles.compactDot,
                { backgroundColor: colors.emotion.fear },
              ]}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.detailedContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Emotional Analysis</Text>
        <View
          style={[styles.sentimentBadge, { backgroundColor: sentimentColor }]}
        >
          <Text style={styles.sentimentText}>{sentimentLabel}</Text>
        </View>
      </View>

      <View style={styles.emotionsGrid}>
        <MoodBadge
          emotion="happiness"
          value={moodMetadata.happiness}
          size="medium"
        />
        <MoodBadge
          emotion="sadness"
          value={moodMetadata.sadness}
          size="medium"
        />
        <MoodBadge emotion="anger" value={moodMetadata.anger} size="medium" />
        <MoodBadge emotion="fear" value={moodMetadata.fear} size="medium" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  compactEmotions: {
    flexDirection: "row",
    gap: spacing[1],
  },
  compactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detailedContainer: {
    padding: spacing[4],
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  sentimentBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: 12,
  },
  sentimentText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  emotionsGrid: {
    gap: spacing[2],
  },
});

export default EmotionVisualization;
