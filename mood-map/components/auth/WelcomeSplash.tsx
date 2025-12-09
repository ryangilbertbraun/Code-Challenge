import React from "react";
import { Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import AppButton from "@/components/ui/AppButton";

interface WelcomeSplashProps {
  height: Animated.Value;
  animateTransition: (stage: "login" | "signup") => void;
}

/**
 * WelcomeSplash Component
 *
 * Initial splash screen with welcome message and action buttons.
 */
const WelcomeSplash: React.FC<WelcomeSplashProps> = ({
  height,
  animateTransition,
}) => {
  return (
    <Animated.View
      style={[
        styles.splashContainer,
        {
          height: height,
        },
      ]}
    >
      <Text style={styles.welcome}>Welcome To MoodMap!</Text>
      <Text style={styles.subtext}>
        Track your emotions and understand {"\n"} your mental wellness journey.
      </Text>
      <AppButton
        label="Get started"
        onPress={() => animateTransition("signup")}
      />

      <TouchableOpacity onPress={() => animateTransition("login")}>
        <Text style={styles.linkText}>I already have an account</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  welcome: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: "#1A1A1A",
    textAlign: "center",
  },
  subtext: {
    fontSize: 16,
    fontWeight: "400",
    color: "#444",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.4,
  },
  primaryBtn: {
    backgroundColor: "#114DA9",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 45,
    height: 56,
    marginBottom: 12,
    marginTop: 12,
    width: "100%",
  },
  primaryBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  linkText: {
    fontSize: 16,
    color: "rgba(21, 34, 57, 0.90)",
    textDecorationLine: "underline",
    marginBottom: 40,
    marginTop: 10,
    fontWeight: "500",
    lineHeight: 24,
  },
});

export default WelcomeSplash;
