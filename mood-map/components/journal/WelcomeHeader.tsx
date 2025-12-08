import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, spacing } from "@/constants/theme";

interface WelcomeHeaderProps {
  totalEntries: number;
}

/**
 * WelcomeHeader Component
 *
 * Displays a personalized welcome message based on time of day.
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

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[4],
  },
  greeting: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  message: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
});

export default WelcomeHeader;
