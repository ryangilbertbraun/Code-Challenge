import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, typography, spacing } from "@/constants/theme";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * AppButton Component
 *
 * Reusable button component following the MoodMap design system.
 * Supports primary, secondary, and outline variants with loading states.
 */
const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.button,
    variant === "primary" && styles.primaryButton,
    variant === "secondary" && styles.secondaryButton,
    variant === "outline" && styles.outlineButton,
    (disabled || loading) && styles.disabledButton,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    variant === "primary" && styles.primaryText,
    variant === "secondary" && styles.secondaryText,
    variant === "outline" && styles.outlineText,
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" ? colors.textPrimary : colors.primary[400]
          }
        />
      ) : (
        <Text style={textStyleCombined}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    width: "100%",
  },
  primaryButton: {
    backgroundColor: colors.primary[400],
  },
  secondaryButton: {
    backgroundColor: "transparent",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary[400],
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 0.2,
  },
  primaryText: {
    color: colors.textPrimary,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  outlineText: {
    color: colors.primary[400],
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default AppButton;
