import React from "react";
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

interface LoginBackgroundProps {
  avatarTop: Animated.Value;
  overlayStyle?: StyleProp<ViewStyle>;
}

/**
 * LoginBackground Component
 *
 * Provides a calming background with video and gradient overlay for authentication screens.
 * Includes an animated circular Lottie avatar that moves during transitions.
 * Matches the reference mobile app's login background pattern exactly.
 */
const LoginBackground: React.FC<LoginBackgroundProps> = ({
  avatarTop,
  overlayStyle,
}) => {
  const videoSource = require("../../assets/videos/writing.mp4");
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <>
      {/* Background Video - Full screen, extends into safe areas */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Overlays - positioned absolutely, no SafeAreaView wrapper */}
      <Animated.View style={[styles.baseOverlay]} />

      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0)",
          "rgba(255, 255, 255, 0.6)",
          "rgba(255, 255, 255, 0.9)",
          "rgb(255, 255, 255)",
          "rgb(255, 255, 255)",
          "rgb(255, 255, 255)",
          "rgb(255, 255, 255)",
          "rgb(255, 255, 255)",
          "rgb(255, 255, 255)",
        ]}
        style={[styles.overlay, overlayStyle]}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.25, y: 1 }}
      />

      <Animated.View style={[styles.avatarContainer, { top: avatarTop }]}>
        <Image
          source={require("../../assets/images/moodmap.png")}
          style={styles.avatar}
        />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  baseOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "20%",
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "57%",
    transform: [{ skewY: "-12deg" }],
  },
  avatarContainer: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 99,
  },
  avatar: {
    width: height < 700 ? 140 : 159, // Smaller on iPhone SE
    height: height < 700 ? 140 : 159,
    borderRadius: height < 700 ? 60 : 80,
  },
});

export default LoginBackground;
