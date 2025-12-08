import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { colors, typography, spacing } from "@/constants/theme";
import { JournalEntry, EntryType, AnalysisStatus } from "@/types/entry.types";
import EmotionVisualization from "./EmotionVisualization";
import { Ionicons } from "@expo/vector-icons";

interface EntryCardProps {
  entry: JournalEntry;
  onPress: () => void;
}

/**
 * EntryCard Component
 *
 * Displays a journal entry in list view with preview content.
 * Shows text preview or video thumbnail based on entry type.
 * Includes timestamp and mood metadata summary.
 */
const EntryCard: React.FC<EntryCardProps> = ({ entry, onPress }) => {
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const entryDate = new Date(date);
    const diffMs = now.getTime() - entryDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return entryDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderContent = () => {
    if (entry.type === EntryType.TEXT) {
      const preview =
        entry.content.length > 120
          ? entry.content.substring(0, 120) + "..."
          : entry.content;

      return (
        <>
          <Text style={styles.textPreview} numberOfLines={3}>
            {preview}
          </Text>
          {entry.analysisStatus === AnalysisStatus.LOADING && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary[400]} />
              <Text style={styles.loadingText}>Analyzing mood...</Text>
            </View>
          )}
          {entry.analysisStatus === AnalysisStatus.SUCCESS &&
            entry.moodMetadata && (
              <EmotionVisualization
                moodMetadata={entry.moodMetadata}
                variant="compact"
              />
            )}
          {entry.analysisStatus === AnalysisStatus.ERROR && (
            <Text style={styles.errorText}>Analysis unavailable</Text>
          )}
        </>
      );
    }

    // Video entry
    return (
      <>
        <View style={styles.videoPreview}>
          {/* Show video first frame as thumbnail */}
          {entry.videoUrl ? (
            <Video
              source={{ uri: entry.videoUrl }}
              style={styles.thumbnail}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping={false}
              isMuted={true}
              positionMillis={0}
              onError={(error) => console.log("Video thumbnail error:", error)}
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.placeholderText}>No video URL</Text>
            </View>
          )}
          <View style={styles.videoDuration}>
            <Text style={styles.durationText}>
              {Math.floor(entry.duration / 60)}:
              {String(entry.duration % 60).padStart(2, "0")}
            </Text>
          </View>
        </View>
        {(entry.analysisStatus === AnalysisStatus.LOADING ||
          entry.analysisStatus === AnalysisStatus.PENDING) && (
          <View style={styles.statusBadge}>
            <Ionicons
              name="time-outline"
              size={12}
              color={colors.textSecondary}
            />
            <Text style={styles.statusBadgeText}>Analysis in progress</Text>
          </View>
        )}
        {entry.analysisStatus === AnalysisStatus.SUCCESS &&
          entry.humeEmotionData && (
            <View style={styles.statusBadge}>
              <Ionicons
                name="checkmark-circle-outline"
                size={12}
                color={colors.success}
              />
              <Text style={styles.statusBadgeText}>Emotion data ready</Text>
            </View>
          )}
        {entry.analysisStatus === AnalysisStatus.ERROR && (
          <View style={styles.statusBadge}>
            <Ionicons
              name="time-outline"
              size={12}
              color={colors.textSecondary}
            />
            <Text style={styles.statusBadgeText}>Still processing</Text>
          </View>
        )}
      </>
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.typeIndicator}>
          <Ionicons
            name={
              entry.type === EntryType.TEXT
                ? "document-text-outline"
                : "videocam-outline"
            }
            size={14}
            color={colors.textSecondary}
            style={styles.typeIcon}
          />
          <Text style={styles.typeText}>
            {entry.type === EntryType.TEXT ? "Text" : "Video"}
          </Text>
        </View>
        <Text style={styles.timestamp}>{formatTimestamp(entry.createdAt)}</Text>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  typeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  typeIcon: {
    marginTop: 1,
  },
  typeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  timestamp: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  content: {
    gap: spacing[3],
  },
  textPreview: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    color: colors.textPrimary,
  },
  videoPreview: {
    position: "relative",
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.neutral[200],
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    gap: spacing[2],
  },
  placeholderText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  videoDuration: {
    position: "absolute",
    bottom: spacing[2],
    right: spacing[2],
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: 6,
  },
  durationText: {
    fontSize: typography.fontSize.xs,
    color: colors.background,
    fontWeight: typography.fontWeight.medium,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
    alignSelf: "flex-start",
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontStyle: "italic",
  },
  humePreview: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  humeLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default EntryCard;
