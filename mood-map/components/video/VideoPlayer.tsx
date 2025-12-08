import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { colors, typography, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface VideoPlayerProps {
  videoUri: string;
  thumbnailUri?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  style?: any;
}

/**
 * VideoPlayer Component
 *
 * Displays and plays video journal entries.
 * Provides playback controls (play, pause, seek).
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUri,
  thumbnailUri,
  autoPlay = false,
  showControls = true,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showPlayButton, setShowPlayButton] = useState(!autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = false;
    player.muted = false;

    if (autoPlay) {
      player.play();
      setShowPlayButton(false);
    }
  });

  // Listen to player status changes
  React.useEffect(() => {
    if (!player) return;

    const subscription = player.addListener("statusChange", (status) => {
      if (status.status === "readyToPlay") {
        setIsLoading(false);
      }
    });

    const timeSubscription = player.addListener(
      "playingChange",
      (isPlaying) => {
        setShowPlayButton(!isPlaying);
      }
    );

    // Update duration when available
    const updateDuration = () => {
      if (player.duration) {
        setDuration(player.duration);
      }
    };

    const durationInterval = setInterval(updateDuration, 500);

    return () => {
      subscription.remove();
      timeSubscription.remove();
      clearInterval(durationInterval);
    };
  }, [player]);

  const togglePlayPause = () => {
    if (!player) return;

    if (player.playing) {
      player.pause();
      setShowPlayButton(true);
    } else {
      player.play();
      setShowPlayButton(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={[styles.container, style]}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="contain"
        nativeControls={false}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary[400]} />
        </View>
      )}

      {showControls && !isLoading && (
        <>
          {/* Play/Pause overlay button */}
          {showPlayButton && (
            <TouchableOpacity
              style={styles.playOverlay}
              onPress={togglePlayPause}
              activeOpacity={0.9}
            >
              <View style={styles.playButton}>
                <Ionicons name="play" size={48} color={colors.background} />
              </View>
            </TouchableOpacity>
          )}

          {/* Bottom controls bar */}
          <View style={styles.controlsBar}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={togglePlayPause}
            >
              <Ionicons
                name={showPlayButton ? "play" : "pause"}
                size={24}
                color={colors.background}
              />
            </TouchableOpacity>

            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.neutral[900],
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlsBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    color: colors.background,
    fontWeight: typography.fontWeight.medium,
  },
});

export default VideoPlayer;
