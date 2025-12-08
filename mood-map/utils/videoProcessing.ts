import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

/**
 * Video Processing Utilities
 *
 * Provides functions for video compression and thumbnail generation.
 */

/**
 * Generate a thumbnail from a video file
 * @param videoUri - URI of the video file
 * @returns URI of the generated thumbnail
 */
export async function generateVideoThumbnail(
  videoUri: string
): Promise<string> {
  try {
    // For now, we'll use a placeholder approach
    // In a production app, you would use expo-video-thumbnails or similar
    // Since expo-video-thumbnails is not in the dependencies, we'll create a simple placeholder

    // TODO: Implement actual thumbnail generation using expo-video-thumbnails
    // For now, return the video URI as placeholder
    return videoUri;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw new Error("Failed to generate video thumbnail");
  }
}

/**
 * Compress a video file
 * @param videoUri - URI of the video file to compress
 * @param quality - Compression quality (0-1, where 1 is highest quality)
 * @returns URI of the compressed video
 */
export async function compressVideo(
  videoUri: string,
  quality: number = 0.8
): Promise<string> {
  try {
    // Video compression is complex and typically requires native modules
    // For now, we'll return the original URI
    // In production, you would use expo-av's compression or a dedicated library

    // TODO: Implement actual video compression
    // Options include:
    // 1. expo-av's compression features
    // 2. react-native-video-processing
    // 3. Backend processing

    return videoUri;
  } catch (error) {
    console.error("Error compressing video:", error);
    throw new Error("Failed to compress video");
  }
}

/**
 * Get video file size in bytes
 * @param videoUri - URI of the video file
 * @returns File size in bytes
 */
export async function getVideoFileSize(videoUri: string): Promise<number> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    // Check if file exists and has size property
    if (fileInfo.exists) {
      // Type guard to check if size property exists
      const fileInfoWithSize = fileInfo as FileSystem.FileInfo & {
        size?: number;
      };
      return fileInfoWithSize.size || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error getting video file size:", error);
    return 0;
  }
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate video file
 * @param videoUri - URI of the video file
 * @param maxSizeBytes - Maximum allowed file size in bytes
 * @returns Object with validation result and error message if invalid
 */
export async function validateVideoFile(
  videoUri: string,
  maxSizeBytes: number = 100 * 1024 * 1024 // 100 MB default
): Promise<{ valid: boolean; error?: string }> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(videoUri);

    if (!fileInfo.exists) {
      return { valid: false, error: "Video file does not exist" };
    }

    // Type guard to check if size property exists
    const fileInfoWithSize = fileInfo as FileSystem.FileInfo & {
      size?: number;
    };
    if (
      fileInfoWithSize.size !== undefined &&
      fileInfoWithSize.size > maxSizeBytes
    ) {
      return {
        valid: false,
        error: `Video file is too large. Maximum size is ${formatFileSize(
          maxSizeBytes
        )}`,
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error validating video file:", error);
    return { valid: false, error: "Failed to validate video file" };
  }
}
