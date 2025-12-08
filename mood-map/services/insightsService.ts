import { supabase } from "@/utils/supabaseClient";
import { AIInsights } from "@/types/insights.types";
import { ErrorCode } from "@/types/error.types";

/**
 * Service for fetching AI-generated insights about user's journal entries
 */
class InsightsService {
  /**
   * Fetch AI insights by calling the Supabase Edge Function
   * The edge function analyzes all recent entries and returns personalized insights
   */
  async getInsights(): Promise<AIInsights> {
    try {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke(
        "analyze-insights",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error("Edge function error:", error);
        throw new Error("Failed to fetch insights");
      }

      if (!data || !data.insights) {
        throw new Error("Invalid response from insights service");
      }

      return {
        ...data.insights,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Unexpected error fetching insights:", error);
      throw error;
    }
  }
}

export const insightsService = new InsightsService();
