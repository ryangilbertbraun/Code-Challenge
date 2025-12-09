import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { colors, typography, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  generateVideoThumbnail,
  compressVideo,
  validateVideoFile,
} from "@/utils/videoProcessing";

interface VideoRecorderProps {
  onRecordingComplete: (
    videoUri: string,
    thumbnailUri: string,
    duration: number
  ) => void;
  onCancel?: () => void;
  maxDuration?: number; // in seconds
}

/**
 * VideoRecorder Component
 *
 * Handles video recording using Expo Camera.
 * Provides recording controls (start, stop, preview).
 * Generates thumbnail and compresses video before returning.
 */
const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  maxDuration = 120, // 2 minutes default
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [facing, setFacing] = useState<CameraType>("back");
  const [isProcessing, setIsProcessing] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Request permission if not granted
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary[400]} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={colors.neutral[400]} />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          MoodMap needs access to your camera to record video journal entries.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      setIsRecording(true);
      recordingStartTimeRef.current = Date.now();

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - recordingStartTimeRef.current) / 1000
        );
        setRecordingDuration(elapsed);

        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);

      const video = await cameraRef.current.recordAsync({
        maxDuration,
      });

      if (video) {
        await handleRecordingComplete(video.uri);
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert(
        "Recording Error",
        "Failed to start recording. Please try again."
      );
      resetRecording();
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      await cameraRef.current.stopRecording();
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const handleRecordingComplete = async (videoUri: string) => {
    setIsProcessing(true);

    // Calculate duration from start time (more reliable than state)
    const actualDuration = recordingStartTimeRef.current
      ? Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
      : recordingDuration;

    try {
      // Validate video file
      const validation = await validateVideoFile(videoUri);
      if (!validation.valid) {
        Alert.alert(
          "Invalid Video",
          validation.error || "Video file is invalid"
        );
        resetRecording();
        return;
      }

      // Compress video
      const compressedUri = await compressVideo(videoUri, 0.8);

      // Generate thumbnail
      const thumbnailUri = await generateVideoThumbnail(compressedUri);

      onRecordingComplete(compressedUri, thumbnailUri, actualDuration);
    } catch (error) {
      console.error("Error processing video:", error);
      Alert.alert(
        "Processing Error",
        "Failed to process video. Please try again."
      );
    } finally {
      setIsProcessing(false);
      resetRecording();
    }
  };

  const resetRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
    recordingStartTimeRef.current = 0;
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    resetRecording();
    onCancel?.();
  };

  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color={colors.primary[400]} />
        <Text style={styles.processingText}>Processing video...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
      />

      {/* Top controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleCancel}
          disabled={isRecording}
        >
          <Ionicons
            name="close"
            size={32}
            color={isRecording ? colors.neutral[500] : colors.background}
          />
        </TouchableOpacity>

        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>
              {formatDuration(recordingDuration)} /{" "}
              {formatDuration(maxDuration)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleCameraFacing}
          disabled={isRecording}
        >
          <Ionicons
            name="camera-reverse"
            size={32}
            color={isRecording ? colors.neutral[500] : colors.background}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <View style={styles.recordButtonContainer}>
          {!isRecording ? (
            <TouchableOpacity
              style={styles.recordButton}
              onPress={startRecording}
            >
              <View style={styles.recordButtonInner} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <View style={styles.stopButtonInner} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[6],
    backgroundColor: colors.background,
  },
  permissionTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
    textAlign: "center",
  },
  permissionText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing[6],
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  permissionButton: {
    backgroundColor: colors.primary[400],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderRadius: 45,
  },
  permissionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing[12],
    paddingHorizontal: spacing[4],
    zIndex: 1,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 20,
    gap: spacing[2],
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  recordingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.background,
  },
  bottomControls: {
    position: "absolute",
    bottom: spacing[8],
    left: 0,
    right: 0,
    alignItems: "center",
  },
  recordButtonContainer: {
    alignItems: "center",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.background,
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.error,
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.background,
  },
  stopButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    gap: spacing[4],
  },
  processingText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default VideoRecorder;
