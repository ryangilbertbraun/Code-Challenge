import { supabase } from "@/utils/supabaseClient";
import {
  JournalEntry,
  TextEntry,
  VideoEntry,
  EntryType,
  AnalysisStatus,
  HumeEmotionData,
  MoodMetadata,
} from "@/types/entry.types";
import { AppError, ErrorCode } from "@/types/error.types";
import { withRetry } from "@/utils/retry";

/**
 * Entry service interface
 */
export interface IEntryService {
  createTextEntry(content: string): Promise<TextEntry>;
  createVideoEntry(videoUri: string, duration?: number): Promise<VideoEntry>;
  getEntries(): Promise<JournalEntry[]>;
  getEntryById(id: string): Promise<JournalEntry>;
  deleteEntry(id: string): Promise<void>;
  updateTextAnalysis(
    entryId: string,
    moodMetadata: MoodMetadata,
    status: AnalysisStatus
  ): Promise<void>;
  updateVideoAnalysis(
    entryId: string,
    humeEmotionData: HumeEmotionData,
    status: AnalysisStatus
  ): Promise<void>;
}

/**
 * Validates text entry content is not empty
 */
function validateTextContent(content: string): void {
  if (!content || content.trim().length === 0) {
    throw {
      code: ErrorCode.ENTRY_EMPTY_CONTENT,
      message: "Entry content cannot be empty",
      retryable: false,
    } as AppError;
  }
}

/**
 * Maps database error to application error
 */
function mapDatabaseError(error: any): AppError {
  const message = error.message?.toLowerCase() || "";

  // Check for network/timeout errors
  if (
    message.includes("timeout") ||
    message.includes("timed out") ||
    error.code === "ETIMEDOUT"
  ) {
    return {
      code: ErrorCode.NETWORK_TIMEOUT,
      message: "Request timed out. Please try again",
      details: error,
      retryable: true,
    };
  }

  // Check for offline/connection errors
  if (
    message.includes("network") ||
    message.includes("connection") ||
    message.includes("offline") ||
    error.code === "ENOTFOUND" ||
    error.code === "ECONNREFUSED"
  ) {
    return {
      code: ErrorCode.NETWORK_OFFLINE,
      message: "No internet connection. Please check your network",
      details: error,
      retryable: true,
    };
  }

  // Check for not found errors
  if (message.includes("not found") || error.code === "PGRST116") {
    return {
      code: ErrorCode.ENTRY_NOT_FOUND,
      message: "Entry not found",
      details: error,
      retryable: false,
    };
  }

  // Check for unauthorized/RLS errors
  if (
    message.includes("permission") ||
    message.includes("unauthorized") ||
    message.includes("row-level security") ||
    error.code === "42501"
  ) {
    return {
      code: ErrorCode.ENTRY_UNAUTHORIZED,
      message: "You do not have permission to access this entry",
      details: error,
      retryable: false,
    };
  }

  // Default server error
  return {
    code: ErrorCode.NETWORK_SERVER_ERROR,
    message: error.message || "An error occurred while accessing the database",
    details: error,
    retryable: true,
  };
}

/**
 * Converts database row to TextEntry
 */
function toTextEntry(row: any): TextEntry {
  return {
    id: row.id,
    userId: row.user_id,
    type: EntryType.TEXT,
    content: row.content,
    moodMetadata: row.mood_metadata,
    analysisStatus: row.analysis_status as AnalysisStatus,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Converts database row to VideoEntry
 */
function toVideoEntry(row: any): VideoEntry {
  return {
    id: row.id,
    userId: row.user_id,
    type: EntryType.VIDEO,
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url,
    duration: row.duration,
    humeEmotionData: row.hume_emotion_data,
    humeJobId: row.hume_job_id,
    analysisStatus: row.analysis_status as AnalysisStatus,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Converts database row to JournalEntry (text or video)
 */
function toJournalEntry(row: any): JournalEntry {
  if (row.entry_type === EntryType.TEXT) {
    return toTextEntry(row);
  } else {
    return toVideoEntry(row);
  }
}

/**
 * Entry service implementation
 */
class EntryService implements IEntryService {
  /**
   * Create a new text journal entry
   */
  async createTextEntry(content: string): Promise<TextEntry> {
    // Validate content
    validateTextContent(content);

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw {
          code: ErrorCode.AUTH_SESSION_EXPIRED,
          message: "You must be logged in to create an entry",
          retryable: false,
        } as AppError;
      }

      // Create entry with retry logic for network errors
      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from("journal_entries")
          .insert({
            user_id: user.id,
            entry_type: EntryType.TEXT,
            content: content,
            analysis_status: AnalysisStatus.PENDING,
          })
          .select()
          .single();

        if (error) {
          throw mapDatabaseError(error);
        }

        if (!data) {
          throw {
            code: ErrorCode.NETWORK_SERVER_ERROR,
            message: "Failed to create entry",
            retryable: true,
          } as AppError;
        }

        return data;
      });

      return toTextEntry(result);
    } catch (error) {
      // If it's already an AppError, rethrow it
      if ((error as AppError).code) {
        throw error;
      }

      // Otherwise, wrap it
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "An unexpected error occurred while creating the entry",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Create a new video journal entry
   */
  async createVideoEntry(
    videoUri: string,
    duration?: number
  ): Promise<VideoEntry> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw {
          code: ErrorCode.AUTH_SESSION_EXPIRED,
          message: "You must be logged in to create an entry",
          retryable: false,
        } as AppError;
      }

      // Upload video to Supabase Storage with retry
      const fileName = `${user.id}/${Date.now()}.mp4`;

      const uploadResult = await withRetry(async () => {
        // Detect the actual file type from the URI
        const fileExtension = videoUri.split(".").pop()?.toLowerCase() || "mp4";
        const mimeType =
          fileExtension === "mov" ? "video/quicktime" : "video/mp4";

        // Get the Supabase session for auth
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        // Use Supabase Storage REST API with FormData
        const formData = new FormData();
        formData.append("", {
          uri: videoUri,
          type: mimeType,
          name: fileName.split("/").pop() || `video.${fileExtension}`,
        } as any);

        const supabaseUrl = supabase.storage
          .from("videos")
          .getPublicUrl("")
          .data.publicUrl.split("/object/public/videos/")[0];
        const uploadUrl = `${supabaseUrl}/object/videos/${fileName}`;

        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        return { path: fileName };
      });

      // Get public URL for the video
      const {
        data: { publicUrl },
      } = supabase.storage.from("videos").getPublicUrl(uploadResult.path);

      // Use video URL as thumbnail
      const thumbnailUrl = publicUrl;

      // Use provided duration or default to 0
      const videoDuration = duration || 0;

      // Submit Hume analysis job (non-blocking)
      let humeJobId: string | null = null;
      try {
        const { humeService } = await import("./humeService");
        humeJobId = await humeService.submitAnalysisJob(publicUrl);
      } catch (error) {
        console.error("Failed to submit Hume job:", error);
      }

      // Create entry with retry logic
      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from("journal_entries")
          .insert({
            user_id: user.id,
            entry_type: EntryType.VIDEO,
            video_url: publicUrl,
            thumbnail_url: thumbnailUrl,
            duration: videoDuration,
            hume_job_id: humeJobId,
            analysis_status: humeJobId
              ? AnalysisStatus.LOADING
              : AnalysisStatus.PENDING,
          })
          .select()
          .single();

        if (error) {
          throw mapDatabaseError(error);
        }

        if (!data) {
          throw {
            code: ErrorCode.NETWORK_SERVER_ERROR,
            message: "Failed to create entry",
            retryable: true,
          } as AppError;
        }

        return data;
      });

      return toVideoEntry(result);
    } catch (error) {
      // If it's already an AppError, rethrow it
      if ((error as AppError).code) {
        throw error;
      }

      // Otherwise, wrap it
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "An unexpected error occurred while creating the video entry",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Get all journal entries for the current user
   */
  async getEntries(): Promise<JournalEntry[]> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw {
          code: ErrorCode.AUTH_SESSION_EXPIRED,
          message: "You must be logged in to view entries",
          retryable: false,
        } as AppError;
      }

      // Fetch entries with retry logic
      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw mapDatabaseError(error);
        }

        return data || [];
      });

      return result.map(toJournalEntry);
    } catch (error) {
      // If it's already an AppError, rethrow it
      if ((error as AppError).code) {
        throw error;
      }

      // Otherwise, wrap it
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "An unexpected error occurred while fetching entries",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Get a specific journal entry by ID
   */
  async getEntryById(id: string): Promise<JournalEntry> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw {
          code: ErrorCode.AUTH_SESSION_EXPIRED,
          message: "You must be logged in to view entries",
          retryable: false,
        } as AppError;
      }

      // Fetch entry with retry logic
      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error) {
          throw mapDatabaseError(error);
        }

        if (!data) {
          throw {
            code: ErrorCode.ENTRY_NOT_FOUND,
            message: "Entry not found",
            retryable: false,
          } as AppError;
        }

        return data;
      });

      return toJournalEntry(result);
    } catch (error) {
      // If it's already an AppError, rethrow it
      if ((error as AppError).code) {
        throw error;
      }

      // Otherwise, wrap it
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "An unexpected error occurred while fetching the entry",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Update text entry with AI mood analysis results
   */
  async updateTextAnalysis(
    entryId: string,
    moodMetadata: MoodMetadata,
    status: AnalysisStatus
  ): Promise<void> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw {
          code: ErrorCode.AUTH_SESSION_EXPIRED,
          message: "You must be logged in to update entries",
          retryable: false,
        } as AppError;
      }

      await withRetry(async () => {
        const { error } = await supabase
          .from("journal_entries")
          .update({
            mood_metadata: moodMetadata,
            analysis_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", entryId)
          .eq("user_id", user.id);

        if (error) {
          throw mapDatabaseError(error);
        }
      });
    } catch (error) {
      console.error("Failed to update text analysis:", error);
      if ((error as AppError).code) {
        throw error;
      }
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "An unexpected error occurred while updating the entry",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Update video entry with Hume analysis results
   */
  async updateVideoAnalysis(
    entryId: string,
    humeEmotionData: HumeEmotionData,
    status: AnalysisStatus
  ): Promise<void> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw {
          code: ErrorCode.AUTH_SESSION_EXPIRED,
          message: "You must be logged in to update entries",
          retryable: false,
        } as AppError;
      }

      await withRetry(async () => {
        const { error } = await supabase
          .from("journal_entries")
          .update({
            hume_emotion_data: humeEmotionData,
            analysis_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", entryId)
          .eq("user_id", user.id);

        if (error) {
          throw mapDatabaseError(error);
        }
      });
    } catch (error) {
      console.error("Failed to update video analysis:", error);
      if ((error as AppError).code) {
        throw error;
      }
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "An unexpected error occurred while updating the entry",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Delete a journal entry
   */
  async deleteEntry(id: string): Promise<void> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw {
          code: ErrorCode.AUTH_SESSION_EXPIRED,
          message: "You must be logged in to delete entries",
          retryable: false,
        } as AppError;
      }

      // Delete entry with retry logic
      await withRetry(async () => {
        const { error } = await supabase
          .from("journal_entries")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          throw mapDatabaseError(error);
        }
      });
    } catch (error) {
      // If it's already an AppError, rethrow it
      if ((error as AppError).code) {
        throw error;
      }

      // Otherwise, wrap it
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "An unexpected error occurred while deleting the entry",
        details: error,
        retryable: true,
      } as AppError;
    }
  }
}

// Export singleton instance
export const entryService = new EntryService();
