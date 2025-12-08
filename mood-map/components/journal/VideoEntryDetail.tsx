import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { colors, typography, spacing } from "@/constants/theme";
import { VideoEntry, AnalysisStatus } from "@/types/entry.types";
import { useEntryStore } from "@/stores/entryStore";

interface VideoEntryDetailProps {
  entry: VideoEntry;
}

/**
 * VideoEntryDetail Component
 *
 * Displays full video entry with video player and Hume emotion data visualization.
 * Shows video playback controls, timestamp, and detailed emotion recognition data.
 */
const VideoEntryDetail: React.FC<VideoEntryDetailProps> = ({ entry }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const videoRef = React.useRef<Video>(null);
  const { checkVideoAnalysis } = useEntryStore();

  // Check analysis status when component mounts or when entry status changes
  useEffect(() => {
    const checkStatus = async () => {
      if (
        entry.humeJobId &&
        (entry.analysisStatus === AnalysisStatus.LOADING ||
          entry.analysisStatus === AnalysisStatus.PENDING)
      ) {
        setIsCheckingStatus(true);
        await checkVideoAnalysis(entry.id);
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [entry.id, entry.analysisStatus, entry.humeJobId, checkVideoAnalysis]);

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const renderHumeEmotionData = () => {
    if (!entry.humeEmotionData) return null;

    const { face, prosody } = entry.humeEmotionData;

    return (
      <View style={styles.humeContainer}>
        <Text style={styles.humeTitle}>Emotion Recognition Data</Text>

        {face && face.emotions && face.emotions.length > 0 && (
          <View style={styles.emotionCategory}>
            <Text style={styles.categoryTitle}>Facial Expressions</Text>
            <View style={styles.emotionList}>
              {face.emotions
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((emotion, index) => (
                  <View key={index} style={styles.emotionItem}>
                    <Text style={styles.emotionName}>{emotion.name}</Text>
                    <View style={styles.emotionBar}>
                      <View
                        style={[
                          styles.emotionBarFill,
                          { width: `${emotion.score * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.emotionScore}>
                      {Math.round(emotion.score * 100)}%
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {prosody && prosody.emotions && prosody.emotions.length > 0 && (
          <View style={styles.emotionCategory}>
            <Text style={styles.categoryTitle}>Vocal Tone</Text>
            <View style={styles.emotionList}>
              {prosody.emotions
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((emotion, index) => (
                  <View key={index} style={styles.emotionItem}>
                    <Text style={styles.emotionName}>{emotion.name}</Text>
                    <View style={styles.emotionBar}>
                      <View
                        style={[
                          styles.emotionBarFill,
                          { width: `${emotion.score * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.emotionScore}>
                      {Math.round(emotion.score * 100)}%
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(entry.createdAt)}</Text>
        <View style={styles.typeIndicator}>
          <Text style={styles.typeText}>
            🎥 Video Entry • {formatDuration(entry.duration)}
          </Text>
        </View>
      </View>

      <View style={styles.videoSection}>
        <Video
          ref={videoRef}
          source={{ uri: entry.videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
            }
          }}
        />
      </View>

      <View style={styles.analysisSection}>
        {entry.analysisStatus === AnalysisStatus.LOADING && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[400]} />
            <Text style={styles.loadingText}>Processing video analysis</Text>
            <Text style={styles.loadingSubtext}>
              Your video is being analyzed in the background. This typically
              takes 1-3 minutes. You can close this screen and check back later.
            </Text>
            <TouchableOpacity
              style={styles.checkButton}
              onPress={async () => {
                setIsCheckingStatus(true);
                const result = await checkVideoAnalysis(entry.id);
                setIsCheckingStatus(false);

                if (result) {
                  Alert.alert(
                    result.success ? "Status Update" : "Still Processing",
                    result.message,
                    [{ text: "OK" }]
                  );
                }
              }}
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.checkButtonText}>Check Status</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {entry.analysisStatus === AnalysisStatus.SUCCESS &&
          entry.humeEmotionData &&
          renderHumeEmotionData()}

        {entry.analysisStatus === AnalysisStatus.ERROR && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>
              Analysis Taking Longer Than Expected
            </Text>
            <Text style={styles.errorMessage}>
              Video analysis is still processing in the background. This can
              sometimes take up to 5 minutes for longer videos. Check back soon
              to see your emotion insights.
            </Text>
            <Text style={styles.errorNote}>
              Your video has been saved and you can watch it anytime.
            </Text>
          </View>
        )}

        {entry.analysisStatus === AnalysisStatus.PENDING && (
          <View style={styles.pendingContainer}>
            <ActivityIndicator size="small" color={colors.primary[400]} />
            <Text style={styles.pendingText}>
              Preparing video for analysis...
            </Text>
            <Text style={styles.pendingSubtext}>
              Analysis will begin shortly
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
    alignSelf: "flex-start",
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  typeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  videoSection: {
    padding: spacing[4],
    backgroundColor: colors.neutral[900],
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
  },
  analysisSection: {
    padding: spacing[4],
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
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing[2],
    textAlign: "center",
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  checkButton: {
    marginTop: spacing[4],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    backgroundColor: colors.primary[400],
    borderRadius: 12,
    minWidth: 140,
    alignItems: "center",
  },
  checkButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.background,
  },
  errorContainer: {
    padding: spacing[4],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },
  errorMessage: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  errorNote: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    fontStyle: "italic",
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  pendingContainer: {
    padding: spacing[4],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    alignItems: "center",
    gap: spacing[2],
  },
  pendingText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    textAlign: "center",
  },
  pendingSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  humeContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
  },
  humeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },
  emotionCategory: {
    marginBottom: spacing[4],
  },
  categoryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing[3],
  },
  emotionList: {
    gap: spacing[3],
  },
  emotionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  emotionName: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    width: 100,
    textTransform: "capitalize",
  },
  emotionBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: "hidden",
  },
  emotionBarFill: {
    height: "100%",
    backgroundColor: colors.primary[400],
    borderRadius: 4,
  },
  emotionScore: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    width: 40,
    textAlign: "right",
  },
});

export default VideoEntryDetail;
