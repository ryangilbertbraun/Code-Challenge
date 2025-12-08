import { HumeEmotionData } from "@/types/entry.types";
import { AppError, ErrorCode } from "@/types/error.types";
import { config } from "@/constants/config";
import { supabase } from "@/utils/supabaseClient";
import { withRetry } from "@/utils/retry";

/**
 * Hume service interface for video emotion analysis
 */
export interface IHumeService {
  analyzeVideo(videoBlob: Blob): Promise<HumeEmotionData>;
}

/**
 * Hume API response types
 */
interface HumeJobResponse {
  job_id: string;
}

interface HumeJobStatus {
  status: "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  predictions?: Array<{
    models: {
      face?: {
        grouped_predictions: Array<{
          predictions: Array<{
            emotions: Array<{ name: string; score: number }>;
          }>;
        }>;
      };
      prosody?: {
        grouped_predictions: Array<{
          predictions: Array<{
            emotions: Array<{ name: string; score: number }>;
          }>;
        }>;
      };
    };
  }>;
  error?: string;
}

/**
 * Hume service implementation using Hume Expression Measurement API
 */
class HumeService implements IHumeService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.hume.ai/v0";
  private readonly pollIntervalMs = 2000; // Poll every 2 seconds
  private readonly maxPollAttempts = 60; // Max 2 minutes of polling

  constructor() {
    this.apiKey = config.hume.apiKey;

    if (!this.apiKey) {
      console.warn(
        "Hume API key is missing. Please add EXPO_PUBLIC_HUME_API_KEY to your .env file"
      );
    }
  }

  /**
   * Uploads a video blob to Supabase Storage
   * @param videoBlob The video blob to upload
   * @returns The public URL of the uploaded video
   */
  private async uploadVideoToStorage(videoBlob: Blob): Promise<string> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const filename = `videos/${timestamp}-${randomId}.mp4`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("videos")
        .upload(filename, videoBlob, {
          contentType: "video/mp4",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("videos").getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "Failed to upload video to storage",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Submits a video URL to Hume API for analysis
   * @param videoUrl The URL of the video to analyze
   * @returns The job ID for polling
   */
  private async submitHumeJob(videoUrl: string): Promise<string> {
    if (!this.apiKey) {
      throw {
        code: ErrorCode.ANALYSIS_HUME_FAILED,
        message: "Hume API key is not configured",
        retryable: false,
      } as AppError;
    }

    try {
      const response = await fetch(`${this.baseUrl}/batch/jobs`, {
        method: "POST",
        headers: {
          "X-Hume-Api-Key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urls: [videoUrl],
          models: {
            face: {},
            prosody: {},
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hume API returned ${response.status}: ${errorText}`);
      }

      const data: HumeJobResponse = await response.json();

      if (!data.job_id) {
        throw new Error("Hume API response missing job_id");
      }

      return data.job_id;
    } catch (error) {
      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes("timeout") || message.includes("timed out")) {
          throw {
            code: ErrorCode.NETWORK_TIMEOUT,
            message: "Request to Hume API timed out",
            details: error,
            retryable: true,
          } as AppError;
        }

        if (
          message.includes("network") ||
          message.includes("connection") ||
          message.includes("fetch failed")
        ) {
          throw {
            code: ErrorCode.NETWORK_OFFLINE,
            message: "Network error while connecting to Hume API",
            details: error,
            retryable: true,
          } as AppError;
        }

        if (
          message.includes("401") ||
          message.includes("403") ||
          message.includes("unauthorized")
        ) {
          throw {
            code: ErrorCode.ANALYSIS_HUME_FAILED,
            message: "Invalid Hume API key",
            details: error,
            retryable: false,
          } as AppError;
        }
      }

      throw {
        code: ErrorCode.ANALYSIS_HUME_FAILED,
        message: "Failed to submit video to Hume API",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Polls Hume API for job results
   * @param jobId The job ID to poll
   * @returns The emotion analysis results
   */
  private async pollForResults(jobId: string): Promise<HumeEmotionData> {
    for (let attempt = 0; attempt < this.maxPollAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/batch/jobs/${jobId}`, {
          method: "GET",
          headers: {
            "X-Hume-Api-Key": this.apiKey,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Hume API returned ${response.status}: ${errorText}`);
        }

        const status: HumeJobStatus = await response.json();

        if (status.status === "COMPLETED") {
          // Extract emotion data from predictions
          return this.extractEmotionData(status);
        }

        if (status.status === "FAILED") {
          throw new Error(
            `Hume job failed: ${status.error || "Unknown error"}`
          );
        }

        // Job is still in progress, wait before polling again
        await new Promise((resolve) =>
          setTimeout(resolve, this.pollIntervalMs)
        );
      } catch (error) {
        // On last attempt, throw the error
        if (attempt === this.maxPollAttempts - 1) {
          if (error instanceof Error) {
            throw {
              code: ErrorCode.ANALYSIS_HUME_FAILED,
              message: "Failed to get results from Hume API",
              details: error,
              retryable: true,
            } as AppError;
          }
          throw error;
        }

        // Otherwise, continue polling
        await new Promise((resolve) =>
          setTimeout(resolve, this.pollIntervalMs)
        );
      }
    }

    // Timeout after max attempts
    throw {
      code: ErrorCode.NETWORK_TIMEOUT,
      message: "Hume analysis timed out after maximum polling attempts",
      retryable: true,
    } as AppError;
  }

  /**
   * Extracts emotion data from Hume API response
   * Stores raw Hume response without normalization
   * @param status The Hume job status response
   * @returns HumeEmotionData with raw emotion scores
   */
  private extractEmotionData(status: HumeJobStatus): HumeEmotionData {
    const emotionData: HumeEmotionData = {};

    if (!status.predictions || status.predictions.length === 0) {
      return emotionData;
    }

    const models = status.predictions[0].models;

    // Extract face emotions (raw, no normalization)
    if (models.face?.grouped_predictions?.[0]?.predictions?.[0]?.emotions) {
      emotionData.face = {
        emotions: models.face.grouped_predictions[0].predictions[0].emotions,
      };
    }

    // Extract prosody emotions (raw, no normalization)
    if (models.prosody?.grouped_predictions?.[0]?.predictions?.[0]?.emotions) {
      emotionData.prosody = {
        emotions: models.prosody.grouped_predictions[0].predictions[0].emotions,
      };
    }

    return emotionData;
  }

  /**
   * Analyzes a video for emotional content using Hume Expression Measurement API
   * @param videoBlob The video blob to analyze
   * @returns HumeEmotionData with raw emotion metrics
   * @throws AppError if analysis fails
   */
  async analyzeVideo(videoBlob: Blob): Promise<HumeEmotionData> {
    // Use retry logic for the entire analysis pipeline
    return withRetry(async () => {
      // Step 1: Upload video to Supabase Storage
      const videoUrl = await this.uploadVideoToStorage(videoBlob);

      // Step 2: Submit job to Hume API
      const jobId = await this.submitHumeJob(videoUrl);

      // Step 3: Poll for results
      const emotionData = await this.pollForResults(jobId);

      return emotionData;
    });
  }
}

// Export singleton instance
export const humeService = new HumeService();
