import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography, spacing } from "@/constants/theme";
import QuickActions from "./QuickActions";

interface HeroSectionProps {
  totalEntries: number;
  onCreateEntry: () => void;
  onViewAll: () => void;
}

/**
 * HeroSection Component
 *
 * Hero section with background video, welcome message, and quick actions.
 * Fades into the rest of the dashboard content.
 */
const HeroSection: React.FC<HeroSectionProps> = ({
  totalEntries,
  onCreateEntry,
  onViewAll,
}) => {
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
    <>
      {/* Background Video - extends beyond container */}
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.backgroundVideo}
          contentFit="cover"
          nativeControls={false}
        />

        {/* Gradient Overlay - lighter at top, fades to white at bottom */}
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0.4)",
            "rgba(255, 255, 255, 0.5)",
            "rgba(255, 255, 255, 0.6)",
            "rgba(255, 255, 255, 0.75)",
            "rgba(255, 255, 255, 0.85)",
            "rgba(255, 255, 255, 0.95)",
            "rgba(255, 255, 255, 1)",
          ]}
          style={styles.gradientOverlay}
        />
      </View>

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

        <View style={styles.actionsContainer}>
          <QuickActions onCreateEntry={onCreateEntry} onViewAll={onViewAll} />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 500, // Extend video beyond the content
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
  content: {
    alignItems: "center",
    paddingTop: spacing[16], // Space for status bar
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[4],
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
    marginBottom: spacing[4],
  },
  actionsContainer: {
    width: "100%",
  },
});

export default HeroSection;
