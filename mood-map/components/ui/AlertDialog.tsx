import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { colors, typography, spacing } from "@/constants/theme";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface AlertDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

/**
 * Custom Alert Dialog Component
 *
 * A beautifully designed alert dialog that replaces the native Alert.alert()
 * with a design that matches the MoodMap app aesthetic.
 *
 * Features:
 * - Blur background overlay
 * - Smooth animations
 * - Customizable buttons with different styles
 * - Matches app's color scheme and typography
 */
export default function AlertDialog({
  visible,
  title,
  message,
  buttons = [{ text: "OK", style: "default" }],
  onDismiss,
}: AlertDialogProps) {
  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    onDismiss?.();
  };

  const handleBackdropPress = () => {
    // Only dismiss if there's a cancel button
    const hasCancelButton = buttons.some((btn) => btn.style === "cancel");
    if (hasCancelButton) {
      onDismiss?.();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        {Platform.OS === "ios" ? (
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={styles.androidBackdrop} />
        )}

        <TouchableOpacity activeOpacity={1} style={styles.dialogContainer}>
          <View style={styles.dialog}>
            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            {message && <Text style={styles.message}>{message}</Text>}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === "cancel" && styles.buttonCancel,
                    button.style === "destructive" && styles.buttonDestructive,
                    buttons.length === 1 && styles.buttonSingle,
                    buttons.length === 2 && index === 0 && styles.buttonLeft,
                    buttons.length === 2 && index === 1 && styles.buttonRight,
                  ]}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      button.style === "cancel" && styles.buttonTextCancel,
                      button.style === "destructive" &&
                        styles.buttonTextDestructive,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  androidBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dialogContainer: {
    width: Dimensions.get("window").width - spacing[8] * 2,
    maxWidth: 400,
  },
  dialog: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing[6],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing[3],
  },
  message: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    marginBottom: spacing[6],
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing[3],
  },
  button: {
    flex: 1,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderRadius: 12,
    backgroundColor: colors.primary[400],
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSingle: {
    flex: 1,
  },
  buttonLeft: {
    flex: 1,
  },
  buttonRight: {
    flex: 1,
  },
  buttonCancel: {
    backgroundColor: colors.neutral[200],
  },
  buttonDestructive: {
    backgroundColor: colors.error,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  buttonTextCancel: {
    color: colors.textSecondary,
  },
  buttonTextDestructive: {
    color: "#fff",
  },
});
