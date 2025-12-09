import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, typography, spacing } from "@/constants/theme";
import { useEntryStore } from "@/stores/entryStore";
import VideoRecorder from "@/components/video/VideoRecorder";
import { Ionicons } from "@expo/vector-icons";
import { useAuthErrorHandler } from "@/hooks/useAuthErrorHandler";
import { useAlert } from "@/contexts/AlertContext";

type InputMode = "text" | "video";

/**
 * CreateEntryScreen Component
 *
 * Screen for creating new journal entries with text or video input.
 * Features:
 * - Tab/toggle to switch between text and video modes
 * - TextInput for text entries
 * - VideoRecorder for video entries
 * - Wired to entryStore.createTextEntry and entryStore.createVideoEntry
 * - Shows loading state during entry creation
 * - Clears input after successful creation
 * - Navigates back to journal list after creation
 *
 * Requirements: 3.1, 3.2, 3.7
 */
const CreateEntryScreen: React.FC = () => {
  const router = useRouter();
  const { createTextEntry, createVideoEntry, isLoading } = useEntryStore();
  const { handleError } = useAuthErrorHandler();
  const alert = useAlert();

  const [mode, setMode] = useState<InputMode>("text");
  const [textContent, setTextContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Handle text entry submission
  const handleTextSubmit = useCallback(async () => {
    const trimmedContent = textContent.trim();

    // Validate non-empty content
    if (!trimmedContent) {
      alert.show({
        title: "Empty Entry",
        message: "Please write something before creating your entry.",
      });
      return;
    }

    try {
      await createTextEntry(trimmedContent);

      // Clear input
      setTextContent("");

      // Show success alert and navigate back
      alert.show({
        title: "Success",
        message: "Your journal entry has been created!",
      });

      // Navigate back after a short delay to let the alert show
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Failed to create text entry:", error);

      // Check if it's an auth error
      const handled = await handleError(error);
      if (!handled) {
        alert.show({
          title: "Error",
          message: "Failed to create your entry. Please try again.",
        });
      }
    }
  }, [textContent, createTextEntry, router, handleError, alert]);

  // Handle video recording complete
  const handleVideoRecordingComplete = useCallback(
    async (videoUri: string, thumbnailUri: string, duration: number) => {
      setIsRecording(false);

      try {
        // Pass the video URI directly - the service will handle the upload
        await createVideoEntry(videoUri, duration);

        // Show success alert and navigate back
        alert.show({
          title: "Success",
          message: "Your video entry has been created!",
        });

        // Navigate back after a short delay to let the alert show
        setTimeout(() => {
          router.back();
        }, 1500);
      } catch (error) {
        console.error("Failed to create video entry:", error);

        // Check if it's an auth error
        const handled = await handleError(error);
        if (!handled) {
          alert.show({
            title: "Error",
            message: "Failed to create your video entry. Please try again.",
          });
        }
      }
    },
    [createVideoEntry, router, handleError, alert]
  );

  // Handle video recording cancel
  const handleVideoCancel = useCallback(() => {
    setIsRecording(false);
  }, []);

  // Handle mode switch
  const handleModeSwitch = useCallback((newMode: InputMode) => {
    setMode(newMode);
    setIsRecording(false);
  }, []);

  // Handle start recording
  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
  }, []);

  // Handle cancel/back
  const handleCancel = useCallback(() => {
    if (textContent.trim() && mode === "text") {
      alert.show({
        title: "Discard Entry?",
        message: "You have unsaved changes. Are you sure you want to go back?",
        buttons: [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      });
    } else {
      router.back();
    }
  }, [textContent, mode, router, alert]);

  // Show video recorder when recording
  if (isRecording) {
    return (
      <VideoRecorder
        onRecordingComplete={handleVideoRecordingComplete}
        onCancel={handleVideoCancel}
        maxDuration={120}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Ionicons
            name="close"
            size={28}
            color={isLoading ? colors.neutral[400] : colors.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>New Entry</Text>

        {mode === "text" ? (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleTextSubmit}
            disabled={isLoading || !textContent.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary[700]} />
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  (!textContent.trim() || isLoading) &&
                    styles.saveButtonTextDisabled,
                ]}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.saveButton}>{/* Video mode - disabled */}</View>
        )}
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "text" && styles.modeButtonActive,
          ]}
          onPress={() => handleModeSwitch("text")}
          disabled={isLoading}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={mode === "text" ? colors.textPrimary : colors.textSecondary}
          />
          <Text
            style={[
              styles.modeButtonText,
              mode === "text" && styles.modeButtonTextActive,
            ]}
          >
            Text
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "video" && styles.modeButtonActive,
            styles.modeButtonDisabled,
          ]}
          onPress={() => {
            // Disabled for now - coming soon
            alert.show({
              title: "Coming Soon",
              message:
                "Video journaling is currently under development. Stay tuned!",
            });
          }}
          disabled={isLoading}
        >
          <Ionicons
            name="videocam-outline"
            size={20}
            color={mode === "video" ? colors.textPrimary : colors.textSecondary}
          />
          <Text
            style={[
              styles.modeButtonText,
              mode === "video" && styles.modeButtonTextActive,
            ]}
          >
            Video
          </Text>
          <View style={styles.comingSoonPill}>
            <Text style={styles.comingSoonPillText}>Soon</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {mode === "text" ? (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="How are you feeling today?"
                placeholderTextColor={colors.textTertiary}
                value={textContent}
                onChangeText={setTextContent}
                multiline
                textAlignVertical="top"
                autoFocus
                editable={!isLoading}
              />
            </View>
          ) : (
            <View style={styles.videoContainer}>
              <View style={styles.videoPlaceholder}>
                <Ionicons
                  name="videocam"
                  size={64}
                  color={colors.neutral[300]}
                />
                <Text style={styles.videoPlaceholderText}>
                  Record a video journal entry
                </Text>
                <Text style={styles.videoPlaceholderSubtext}>
                  Share your thoughts and emotions through video
                </Text>
              </View>

              {/* Coming Soon Overlay */}
              <View style={styles.comingSoonOverlay}>
                <View style={styles.comingSoonBadge}>
                  <Ionicons
                    name="time-outline"
                    size={32}
                    color={colors.primary[600]}
                  />
                  <Text style={styles.comingSoonTitle}>Coming Soon</Text>
                  <Text style={styles.comingSoonText}>
                    Video journaling is currently under development
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
  },
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  saveButtonTextDisabled: {
    color: colors.neutral[300],
  },
  modeToggle: {
    flexDirection: "row",
    padding: spacing[4],
    gap: spacing[2],
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    gap: spacing[2],
  },
  modeButtonActive: {
    backgroundColor: colors.primary[400],
    borderWidth: 2,
    borderColor: colors.primary[600],
  },
  modeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.bold,
  },
  modeButtonDisabled: {
    opacity: 0.6,
  },
  comingSoonPill: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 8,
    marginLeft: spacing[1],
  },
  comingSoonPillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: spacing[4],
  },
  textInputContainer: {
    flex: 1,
    minHeight: 200,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    padding: spacing[4],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholder: {
    alignItems: "center",
    padding: spacing[8],
  },
  videoPlaceholderText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginTop: spacing[4],
    textAlign: "center",
  },
  videoPlaceholderSubtext: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing[2],
    textAlign: "center",
  },
  comingSoonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  comingSoonBadge: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing[8],
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  comingSoonTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  comingSoonText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 250,
  },
});

export default CreateEntryScreen;
