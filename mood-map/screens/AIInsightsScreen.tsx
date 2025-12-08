import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { useInsightsStore } from "@/stores/insightsStore";
import { colors, typography, spacing } from "@/constants/theme";
import { TrendType } from "@/types/insights.types";

/**
 * AI Insights Screen
 * Displays personalized AI analysis of user's journal entries
 * Only runs analysis when user explicitly taps the button
 */
export default function AIInsightsScreen() {
  const { insights, isLoading, error, fetchInsights } = useInsightsStore();

  const handleAnalyze = () => {
    fetchInsights();
  };

  const videoSource = require("@/assets/videos/writing.mp4");
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  // Show empty state when no insights yet
  if (!insights && !isLoading && !error) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.heroSection}>
          <View style={styles.videoContainer}>
            <VideoView
              player={player}
              style={styles.backgroundVideo}
              contentFit="cover"
              nativeControls={false}
            />
            <LinearGradient
              colors={[
                "rgba(255, 252, 252, 0.5)",
                "rgba(255, 252, 252, 0.7)",
                "rgba(255, 252, 252, 0.85)",
                "rgba(255, 252, 252, 1)",
              ]}
              style={styles.gradientOverlay}
            />
          </View>
          <View style={styles.heroContent}>
            <Ionicons
              name="bulb-outline"
              size={48}
              color={colors.primary[600]}
              style={styles.heroIcon}
            />
            <Text style={styles.heroTitle}>AI Insights</Text>
            <Text style={styles.heroSubtitle}>
              Get personalized analysis of your emotional journey
            </Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="search-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>Ready to Analyze</Text>
          <Text style={styles.emptyMessage}>
            Tap the button below to generate AI insights based on your recent
            journal entries
          </Text>
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={handleAnalyze}
            activeOpacity={0.8}
          >
            <Text style={styles.analyzeButtonText}>Generate Insights</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.heroSection}>
          <View style={styles.videoContainer}>
            <VideoView
              player={player}
              style={styles.backgroundVideo}
              contentFit="cover"
              nativeControls={false}
            />
            <LinearGradient
              colors={[
                "rgba(255, 252, 252, 0.5)",
                "rgba(255, 252, 252, 0.7)",
                "rgba(255, 252, 252, 0.85)",
                "rgba(255, 252, 252, 1)",
              ]}
              style={styles.gradientOverlay}
            />
          </View>
          <View style={styles.heroContent}>
            <Ionicons
              name="bulb-outline"
              size={48}
              color={colors.primary[600]}
              style={styles.heroIcon}
            />
            <Text style={styles.heroTitle}>AI Insights</Text>
            <Text style={styles.heroSubtitle}>
              Analyzing your emotional journey
            </Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>
            Analyzing your journal entries...
          </Text>
          <Text style={styles.loadingSubtext}>This may take a moment</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.heroSection}>
          <View style={styles.videoContainer}>
            <VideoView
              player={player}
              style={styles.backgroundVideo}
              contentFit="cover"
              nativeControls={false}
            />
            <LinearGradient
              colors={[
                "rgba(255, 252, 252, 0.5)",
                "rgba(255, 252, 252, 0.7)",
                "rgba(255, 252, 252, 0.85)",
                "rgba(255, 252, 252, 1)",
              ]}
              style={styles.gradientOverlay}
            />
          </View>
          <View style={styles.heroContent}>
            <Ionicons
              name="bulb-outline"
              size={48}
              color={colors.primary[600]}
              style={styles.heroIcon}
            />
            <Text style={styles.heroTitle}>AI Insights</Text>
            <Text style={styles.heroSubtitle}>
              Get personalized analysis of your emotional journey
            </Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Unable to Generate Insights</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleAnalyze}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.videoContainer}>
            <VideoView
              player={player}
              style={styles.backgroundVideo}
              contentFit="cover"
              nativeControls={false}
            />
            <LinearGradient
              colors={[
                "rgba(255, 252, 252, 0.5)",
                "rgba(255, 252, 252, 0.7)",
                "rgba(255, 252, 252, 0.85)",
                "rgba(255, 252, 252, 1)",
              ]}
              style={styles.gradientOverlay}
            />
          </View>
          <View style={styles.heroContent}>
            <Ionicons
              name="bulb-outline"
              size={48}
              color={colors.primary[600]}
              style={styles.heroIcon}
            />
            <Text style={styles.heroTitle}>AI Insights</Text>
            <Text style={styles.heroSubtitle}>
              Personalized analysis of your emotional journey
            </Text>
          </View>
        </View>

        {insights && (
          <View style={styles.contentSection}>
            {/* Mood Score */}
            {insights.moodScore !== null && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Overall Wellbeing</Text>
                <View style={styles.moodScoreContainer}>
                  <View style={styles.scoreCircle}>
                    <Text
                      style={[
                        styles.scoreText,
                        { color: getMoodScoreColor(insights.moodScore) },
                      ]}
                    >
                      {insights.moodScore}
                    </Text>
                    <Text style={styles.scoreLabel}>/ 100</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Summary</Text>
              <Text style={styles.summaryText}>{insights.summary}</Text>
            </View>

            {/* Emotional Breakdown */}
            {insights.emotionalBreakdown && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Emotional Breakdown</Text>
                <View style={styles.emotionBars}>
                  {Object.entries(insights.emotionalBreakdown).map(
                    ([emotion, percentage]) => (
                      <View key={emotion} style={styles.emotionRow}>
                        <Text style={styles.emotionLabel}>
                          {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                        </Text>
                        <View style={styles.barContainer}>
                          <View
                            style={[
                              styles.bar,
                              {
                                width: `${percentage}%`,
                                backgroundColor: getEmotionColor(emotion),
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.percentageText}>{percentage}%</Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            )}

            {/* Trends */}
            {insights.trends.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Trends</Text>
                {insights.trends.map((trend, index) => (
                  <View key={index} style={styles.trendItem}>
                    <View style={styles.trendHeader}>
                      <Ionicons
                        name={getTrendIcon(trend.type)}
                        size={20}
                        color={getTrendColor(trend.type)}
                      />
                      <Text style={styles.trendTitle}>{trend.title}</Text>
                    </View>
                    <Text style={styles.trendDescription}>
                      {trend.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommendations */}
            {insights.recommendations.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Recommendations</Text>
                {insights.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <View style={styles.recommendationHeader}>
                      <Ionicons
                        name="bulb-outline"
                        size={20}
                        color={colors.primary[600]}
                      />
                      <Text style={styles.recommendationTitle}>
                        {rec.title}
                      </Text>
                    </View>
                    <Text style={styles.recommendationDescription}>
                      {rec.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Footer with timestamp and regenerate button */}
            <View style={styles.footerSection}>
              {insights.generatedAt && (
                <Text style={styles.timestamp}>
                  Last updated:{" "}
                  {new Date(insights.generatedAt).toLocaleString()}
                </Text>
              )}
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={handleAnalyze}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color={colors.textPrimary}
                />
                <Text style={styles.regenerateButtonText}>
                  Regenerate Insights
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions
function getMoodScoreColor(score: number): string {
  if (score >= 70) return "#4CAF50";
  if (score >= 40) return "#FF9800";
  return "#F44336";
}

function getEmotionColor(emotion: string): string {
  const emotionColors: Record<string, string> = {
    happiness: "#4CAF50",
    sadness: "#2196F3",
    anger: "#F44336",
    fear: "#9C27B0",
  };
  return emotionColors[emotion] || "#757575";
}

function getTrendIcon(type: TrendType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case TrendType.POSITIVE:
      return "trending-up";
    case TrendType.CONCERN:
      return "alert-circle-outline";
    default:
      return "arrow-forward";
  }
}

function getTrendColor(type: TrendType): string {
  switch (type) {
    case TrendType.POSITIVE:
      return colors.success;
    case TrendType.CONCERN:
      return colors.warning;
    default:
      return colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: spacing[8],
  },
  heroSection: {
    position: "relative",
    overflow: "hidden",
    minHeight: 240,
  },
  videoContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    overflow: "hidden",
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    alignItems: "center",
    paddingTop: spacing[12],
    paddingBottom: spacing[6],
    paddingHorizontal: spacing[4],
    zIndex: 1,
  },
  heroIcon: {
    marginBottom: spacing[3],
  },
  heroTitle: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },
  heroSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[6],
    gap: spacing[4],
  },

  emptyTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  analyzeButton: {
    backgroundColor: colors.primary[400],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: 12,
    marginTop: spacing[4],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyzeButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing[3],
    padding: spacing[6],
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  loadingSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[6],
  },

  errorTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  retryButton: {
    backgroundColor: colors.primary[400],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: 12,
    marginTop: spacing[2],
  },
  retryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  contentSection: {
    padding: spacing[4],
    gap: spacing[4],
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing[5],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },
  moodScoreContainer: {
    alignItems: "center",
    paddingVertical: spacing[3],
  },
  scoreCircle: {
    alignItems: "center",
  },
  scoreText: {
    fontSize: 56,
    fontWeight: typography.fontWeight.bold,
  },
  scoreLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  summaryText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    color: colors.textPrimary,
  },
  emotionBars: {
    gap: spacing[3],
  },
  emotionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  emotionLabel: {
    width: 80,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: colors.neutral[200],
    borderRadius: 5,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 5,
  },
  percentageText: {
    width: 45,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: "right",
    fontWeight: typography.fontWeight.medium,
  },
  trendItem: {
    marginBottom: spacing[3],
  },
  trendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[1],
  },

  trendTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  trendDescription: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    color: colors.textSecondary,
    marginLeft: 28,
  },
  recommendationItem: {
    marginBottom: spacing[3],
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[1],
  },

  recommendationTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  recommendationDescription: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    color: colors.textSecondary,
    marginLeft: 28,
  },
  footerSection: {
    alignItems: "center",
    gap: spacing[3],
    marginTop: spacing[2],
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: "center",
  },
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.primary[400],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  regenerateButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
});
