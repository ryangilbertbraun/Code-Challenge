import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { colors, typography, spacing } from "@/constants/theme";
import { Link } from "expo-router";

/**
 * Storybook Navigation Screen
 *
 * This screen provides links to view individual component stories.
 * For full Storybook experience, see STORYBOOK.md
 */
export default function StorybookScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Component Showcase</Text>
        <Text style={styles.subtitle}>
          View individual components in isolation
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Journal Components</Text>

        <ComponentLink
          title="MoodBadge"
          description="Individual emotion badges with colors"
          stories={8}
        />

        <ComponentLink
          title="EmotionVisualization"
          description="Complete mood metadata display"
          stories={7}
        />

        <ComponentLink
          title="EntryCard"
          description="Journal entry preview cards"
          stories={7}
        />

        <ComponentLink
          title="TextEntryDetail"
          description="Full text entry view"
          stories={5}
        />

        <ComponentLink
          title="VideoEntryDetail"
          description="Video player with emotion data"
          stories={6}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          💡 For full interactive Storybook experience, see STORYBOOK.md
        </Text>
      </View>
    </ScrollView>
  );
}

function ComponentLink({
  title,
  description,
  stories,
}: {
  title: string;
  description: string;
  stories: number;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      <Text style={styles.cardStories}>{stories} stories available</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing[6],
    backgroundColor: colors.primary[400],
  },
  title: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing[4],
    borderRadius: 12,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  cardDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  cardStories: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  info: {
    padding: spacing[4],
    margin: spacing[4],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
