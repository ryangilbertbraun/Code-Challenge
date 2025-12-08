import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useRouter } from "expo-router";

import LoginBackground from "@/components/auth/LoginBackground";
import WelcomeSplash from "@/components/auth/WelcomeSplash";
import SignupForm from "@/components/auth/SignupForm";
import LoginForm from "@/components/auth/LoginForm";
import { useAuthStore } from "@/stores/authStore";

/**
 * AuthScreen Component
 *
 * Main authentication screen with animated transitions between splash, login, and signup states.
 * Matches the reference mobile app's authentication flow exactly.
 *
 * Features:
 * - Animated avatar that moves during transitions
 * - Background video with gradient overlay
 * - Smooth transitions between splash, login, and signup
 * - Responsive height calculations for different screen sizes
 * - Integrated with authStore for authentication
 */
export default function AuthScreen() {
  const { height } = Dimensions.get("window");
  const [stage, setStage] = useState<"splash" | "login" | "signup">("splash");
  const [avatarTop] = useState(new Animated.Value(hp("38%")));
  const [formHeight] = useState(new Animated.Value(0));
  const [optionsHeight] = useState(new Animated.Value(0));
  const [splashHeight] = useState(new Animated.Value(250));
  const [optionsOpacity] = useState(new Animated.Value(0));

  // Navigation
  const router = useRouter();

  // Auth store
  const { login, signup, isLoading, error, clearError, setError } =
    useAuthStore();

  // Unified heights for both login and signup
  const getAvatarHeight = () => {
    if (height < 700) {
      return hp("8%"); // Much higher for very small screens (iPhone SE)
    }
    if (height < 800) {
      return hp("15%"); // Higher for small screens
    }
    if (height < 900) {
      return hp("28%"); // Higher for medium screens (iPhone 16 Pro)
    }
    return hp("30%"); // Standard for very large screens
  };

  const getOptionsHeight = () => {
    if (height < 700) {
      return hp("55%"); // Balanced space for very small screens
    }
    if (height < 800) {
      return hp("50%"); // Balanced space for small screens
    }
    return hp("44%"); // Slightly taller for larger screens
  };

  const getFormHeight = () => {
    if (height < 700) {
      return hp("62%"); // Balanced space for very small screens
    }
    if (height < 800) {
      return hp("56%"); // Balanced space for small screens
    }
    return hp("50%"); // Slightly taller for larger screens
  };

  const getFormMarginTop = () => {
    if (height < 700) {
      return 160; // Balanced margin for very small screens
    }
    if (height < 800) {
      return 220; // Balanced margin for small screens
    }
    return 280; // Standard margin for larger screens
  };

  // Handle keyboard events to move avatar out of the way
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        // Move avatar way up when keyboard shows
        Animated.timing(avatarTop, {
          toValue: -200, // Move off screen
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        // Move avatar back to normal position
        if (stage !== "splash") {
          Animated.timing(avatarTop, {
            toValue: getAvatarHeight(),
            duration: 250,
            useNativeDriver: false,
          }).start();
        }
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [stage]);

  const animateTransition = (targetStage: "login" | "signup") => {
    clearError();
    Animated.timing(avatarTop, {
      toValue: getAvatarHeight(),
      duration: 600,
      easing: Easing.inOut(Easing.ease),
      delay: 300,
      useNativeDriver: false,
    }).start(() => setStage(targetStage));
    Animated.timing(optionsHeight, {
      toValue: getOptionsHeight(),
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      delay: 900,
      useNativeDriver: false,
    }).start(() => setStage(targetStage));
    Animated.timing(formHeight, {
      toValue: getFormHeight(),
      duration: 500,
      delay: 900,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease),
    }).start(() => setStage(targetStage));
    Animated.timing(splashHeight, {
      toValue: 0,
      duration: 600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
    Animated.timing(optionsOpacity, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  };

  const animateTransitionBack = () => {
    clearError();
    Animated.timing(avatarTop, {
      toValue: hp("38%"),
      duration: 500,
      useNativeDriver: false,
    }).start();
    Animated.timing(optionsHeight, {
      toValue: 0,
      duration: 400,
      useNativeDriver: false,
    }).start();

    Animated.timing(formHeight, {
      toValue: 0,
      duration: 600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setStage("splash");
    });
    Animated.timing(splashHeight, {
      toValue: 250,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      delay: 300,
      useNativeDriver: false,
    }).start();
    Animated.timing(optionsOpacity, {
      toValue: 0,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
      // Navigate to home screen on success
      router.replace("/(tabs)");
    } catch (error) {
      // Error is already set in the store and will be displayed in the form
      console.error("Login error:", error);
    }
  };

  const handleSignupEmail = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signup({ email, password, confirmPassword });
      // Navigate to home screen on success (auto-login is handled by authStore)
      router.replace("/(tabs)");
    } catch (error) {
      // Error is already set in the store and will be displayed in the form
      console.error("Signup error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.fullscreen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <LoginBackground avatarTop={avatarTop} />
        {stage === "splash" && (
          <WelcomeSplash
            height={splashHeight}
            animateTransition={animateTransition}
          />
        )}
        {stage !== "splash" && (
          <Animated.View
            style={[
              styles.formContainer,
              {
                marginTop: getFormMarginTop(),
                height: formHeight,
                opacity: optionsOpacity,
              },
            ]}
          >
            {stage === "signup" && (
              <SignupForm
                opacity={optionsOpacity}
                height={optionsHeight}
                onEmailPress={handleSignupEmail}
                animateTransitionBack={animateTransitionBack}
                loading={isLoading}
                error={error}
              />
            )}
            {stage === "login" && (
              <LoginForm
                opacity={optionsOpacity}
                height={optionsHeight}
                onLogin={handleLogin}
                animateTransitionBack={animateTransitionBack}
                loading={isLoading}
                error={error}
              />
            )}
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
    position: "relative",
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "column",
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 32,
    backgroundColor: "white",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
});
