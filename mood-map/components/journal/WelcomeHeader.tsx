import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography, spacing } from "@/constants/theme";

interface WelcomeHeaderProps {
  totalEntries: number;
}

/**
 * WelcomeHeader Component
 *
 * Displays a personalized welcome message based on time of day with the MoodMap logo
 * and a subtle background video for visual appeal.
 */
const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ totalEntries }) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const message = useMemo(() => {
    if (totalEntries === 0) {
      return "Start your journaling journey today";
    }
    if (totalEntries === 1) {
      return "You've started your journey";
    }
    if (totalEntries < 10) {
      return "You're building a great habit";
    }
    return "Keep up the amazing work";
  }, [totalEntries]);

  const videoSource = require("@/assets/videos/writing_book.mp4");
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <VideoView
        player={player}
        style={styles.backgroundVideo}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0.85)",
          "rgba(255, 255, 255, 0.9)",
          "rgba(255, 255, 255, 0.95)",
        ]}
        style={styles.gradientOverlay}
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/moodmap.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[6],
    alignItems: "center",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
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
  content: {
    alignItems: "center",
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: spacing[4],
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
  },
  greeting: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
    textAlign: "center",
  },
  message: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default WelcomeHeader;
