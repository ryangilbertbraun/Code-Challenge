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
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, typography, spacing } from "@/constants/theme";
import { useEntryStore } from "@/stores/entryStore";
import { EntryType } from "@/types/entry.types";
import VideoRecorder from "@/components/video/VideoRecorder";
import AppButton from "@/components/ui/AppButton";
import { Ionicons } from "@expo/vector-icons";

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

  const [mode, setMode] = useState<InputMode>("text");
  const [textContent, setTextContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Handle text entry submission
  const handleTextSubmit = useCallback(async () => {
    const trimmedContent = textContent.trim();

    // Validate non-empty content
    if (!trimmedContent) {
      Alert.alert(
        "Empty Entry",
        "Please write something before creating your entry."
      );
      return;
    }

    try {
      await createTextEntry(trimmedContent);

      // Clear input and navigate back
      setTextContent("");
      Alert.alert("Success", "Your journal entry has been created!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to create text entry:", error);
      Alert.alert("Error", "Failed to create your entry. Please try again.");
    }
  }, [textContent, createTextEntry, router]);

  // Handle video recording complete
  const handleVideoRecordingComplete = useCallback(
    async (videoUri: string, thumbnailUri: string, duration: number) => {
      setIsRecording(false);

      try {
        // Pass the video URI directly - the service will handle the upload
        await createVideoEntry(videoUri, duration);

        // Navigate back
        Alert.alert("Success", "Your video entry has been created!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } catch (error) {
        console.error("Failed to create video entry:", error);
        Alert.alert(
          "Error",
          "Failed to create your video entry. Please try again."
        );
      }
    },
    [createVideoEntry, router]
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
      Alert.alert(
        "Discard Entry?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  }, [textContent, mode, router]);

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
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

        <View style={styles.headerButton} />
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
            color={mode === "text" ? colors.primary[400] : colors.textSecondary}
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
          ]}
          onPress={() => handleModeSwitch("video")}
          disabled={isLoading}
        >
          <Ionicons
            name="videocam-outline"
            size={20}
            color={
              mode === "video" ? colors.primary[400] : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.modeButtonText,
              mode === "video" && styles.modeButtonTextActive,
            ]}
          >
            Video
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
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
              <Ionicons name="videocam" size={64} color={colors.neutral[300]} />
              <Text style={styles.videoPlaceholderText}>
                Record a video journal entry
              </Text>
              <Text style={styles.videoPlaceholderSubtext}>
                Share your thoughts and emotions through video
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        {mode === "text" ? (
          <AppButton
            label={isLoading ? "Creating..." : "Create Entry"}
            onPress={handleTextSubmit}
            disabled={isLoading || !textContent.trim()}
            loading={isLoading}
          />
        ) : (
          <AppButton
            label="Start Recording"
            onPress={handleStartRecording}
            disabled={isLoading}
          />
        )}
      </View>
    </KeyboardAvoidingView>
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
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[400],
  },
  modeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.primary[400],
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
  footer: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});

export default CreateEntryScreen;
