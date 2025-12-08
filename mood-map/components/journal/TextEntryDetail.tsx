import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing } from "@/constants/theme";
import { TextEntry, AnalysisStatus } from "@/types/entry.types";
import EmotionVisualization from "./EmotionVisualization";

interface TextEntryDetailProps {
  entry: TextEntry;
}

/**
 * TextEntryDetail Component
 *
 * Displays full text entry with complete mood metadata visualization.
 * Shows entry content, timestamp, and detailed emotional analysis.
 */
const TextEntryDetail: React.FC<TextEntryDetailProps> = ({ entry }) => {
  const formatDate = (date: Date) => {
    const entryDate = new Date(date);
    return entryDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(entry.createdAt)}</Text>
        <View style={styles.typeIndicator}>
          <Ionicons
            name="document-text-outline"
            size={16}
            color={colors.textSecondary}
            style={styles.typeIcon}
          />
          <Text style={styles.typeText}>Text Entry</Text>
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.content}>{entry.content}</Text>
      </View>

      <View style={styles.analysisSection}>
        {entry.analysisStatus === AnalysisStatus.LOADING && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[400]} />
            <Text style={styles.loadingText}>
              Analyzing your mood and emotions...
            </Text>
            <Text style={styles.loadingSubtext}>
              This usually takes a few seconds
            </Text>
          </View>
        )}

        {entry.analysisStatus === AnalysisStatus.SUCCESS &&
          entry.moodMetadata && (
            <EmotionVisualization
              moodMetadata={entry.moodMetadata}
              variant="detailed"
            />
          )}

        {entry.analysisStatus === AnalysisStatus.ERROR && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Analysis Unavailable</Text>
            <Text style={styles.errorMessage}>
              We couldn't analyze the emotional content of this entry. The entry
              has been saved, but mood data is not available.
            </Text>
          </View>
        )}

        {entry.analysisStatus === AnalysisStatus.PENDING && (
          <View style={styles.pendingContainer}>
            <Text style={styles.pendingText}>
              Mood analysis will begin shortly...
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  date: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },
  typeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
    alignSelf: "flex-start",
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  typeIcon: {
    marginTop: 1,
  },
  typeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  contentSection: {
    padding: spacing[4],
  },
  content: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    color: colors.textPrimary,
  },
  analysisSection: {
    padding: spacing[4],
    paddingTop: 0,
  },
  loadingContainer: {
    alignItems: "center",
    padding: spacing[6],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginTop: spacing[3],
  },
  loadingSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  errorContainer: {
    padding: spacing[4],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
    marginBottom: spacing[2],
  },
  errorMessage: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    color: colors.textSecondary,
  },
  pendingContainer: {
    padding: spacing[4],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    alignItems: "center",
  },
  pendingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
});

export default TextEntryDetail;
