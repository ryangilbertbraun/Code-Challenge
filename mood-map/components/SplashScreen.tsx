import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import * as SplashScreen from "expo-splash-screen";

interface CustomSplashScreenProps {
  onFinish: () => void;
}

/**
 * Custom Splash Screen with Video
 *
 * Displays the splash video when the app first loads.
 * Automatically hides after the video plays once.
 */
export default function CustomSplashScreen({
  onFinish,
}: CustomSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const videoSource = require("@/assets/videos/splashmovie.mp4");

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.muted = false;
    player.play();
  });

  useEffect(() => {
    // Keep the native splash screen visible while we prepare
    SplashScreen.preventAutoHideAsync();

    // Listen for when video finishes playing
    const subscription = player.addListener("playingChange", (event) => {
      if (!event.isPlaying && player.currentTime > 0) {
        // Video finished, fade out and call onFinish
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          SplashScreen.hideAsync();
          onFinish();
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, fadeAnim, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFCFC",
    zIndex: 9999,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
