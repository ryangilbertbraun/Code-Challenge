/// <reference types="https://deno.land/x/types/index.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EntryData {
  id: string;
  entry_type: "text" | "video";
  content?: string;
  created_at: string;
  mood_metadata?: {
    happiness: number;
    fear: number;
    sadness: number;
    anger: number;
    sentiment: string;
  };
  hume_emotion_data?: any;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      throw new Error("Server configuration error");
    }

    // Get authorization header to verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      throw new Error("Missing authorization header");
    }

    // Create client with user's auth token to verify identity
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get current user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (userError) {
      console.error("Auth error:", userError);
      throw new Error("Authentication failed");
    }

    if (!user) {
      console.error("No user found");
      throw new Error("Unauthorized");
    }

    console.log("User authenticated:", user.id);

    // Fetch user's entries from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log("Fetching entries for user:", user.id);
    console.log("Date range:", thirtyDaysAgo.toISOString(), "to now");

    const { data: entries, error: entriesError } = await supabaseClient
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (entriesError) {
      console.error("Database error:", entriesError);
      throw entriesError;
    }

    console.log("Found entries:", entries?.length || 0);

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({
          insights: {
            summary:
              "No entries found in the last 30 days. Start journaling to get personalized insights!",
            trends: [],
            recommendations: [],
            moodScore: null,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Prepare data for AI analysis
    const analysisData = prepareAnalysisData(entries as EntryData[]);
    console.log("Prepared analysis data:", {
      totalEntries: analysisData.totalEntries,
      textEntries: analysisData.textEntries.length,
      videoEntries: analysisData.videoEntries.length,
    });

    // Call OpenAI for insights
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("OpenAI API key not configured");
      throw new Error("OpenAI API key not configured");
    }

    console.log("Building prompt for OpenAI...");
    const prompt = buildAnalysisPrompt(analysisData);

    console.log("Calling OpenAI API...");
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a compassionate mental health insights assistant. Analyze journal entries and provide supportive, actionable insights about emotional patterns and trends. Be empathetic and encouraging.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    console.log("Parsing OpenAI response...");
    const openaiData = await openaiResponse.json();
    const insights = JSON.parse(openaiData.choices[0].message.content);
    console.log("Successfully generated insights");

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function prepareAnalysisData(entries: EntryData[]) {
  const textEntries = entries
    .filter((e) => e.entry_type === "text" && e.content)
    .map((e) => ({
      date: e.created_at,
      content: e.content?.substring(0, 500), // Limit content length
      mood: e.mood_metadata,
    }));

  const videoEntries = entries
    .filter((e) => e.entry_type === "video" && e.hume_emotion_data)
    .map((e) => ({
      date: e.created_at,
      emotions: e.hume_emotion_data,
    }));

  return {
    totalEntries: entries.length,
    textEntries: textEntries.slice(0, 20), // Limit to recent 20
    videoEntries: videoEntries.slice(0, 10), // Limit to recent 10
    dateRange: {
      start: entries[entries.length - 1]?.created_at,
      end: entries[0]?.created_at,
    },
  };
}

function buildAnalysisPrompt(data: any): string {
  return `Analyze the following journal entries and provide insights in JSON format.

Data:
- Total entries: ${data.totalEntries}
- Date range: ${data.dateRange.start} to ${data.dateRange.end}
- Text entries: ${data.textEntries.length}
- Video entries: ${data.videoEntries.length}

Text Entries (with mood analysis):
${JSON.stringify(data.textEntries, null, 2)}

Video Entries (with emotion data):
${JSON.stringify(data.videoEntries, null, 2)}

Provide a JSON response with this structure:
{
  "summary": "A brief 2-3 sentence overview of the user's emotional state and patterns",
  "moodScore": <number 0-100 representing overall wellbeing>,
  "trends": [
    {
      "title": "Trend name",
      "description": "What you noticed",
      "type": "positive" | "neutral" | "concern"
    }
  ],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Actionable suggestion",
      "priority": "high" | "medium" | "low"
    }
  ],
  "emotionalBreakdown": {
    "happiness": <percentage>,
    "sadness": <percentage>,
    "anger": <percentage>,
    "fear": <percentage>
  }
}

Focus on:
1. Emotional patterns and trends over time
2. Frequency and consistency of journaling
3. Dominant emotions and their context
4. Positive developments to celebrate
5. Areas that might need attention
6. Practical, supportive recommendations`;
}
