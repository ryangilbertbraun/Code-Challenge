# AI Insights Edge Function

This Supabase Edge Function analyzes a user's journal entries and provides personalized AI-generated insights about emotional patterns, trends, and recommendations.

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Link to your Supabase project

```bash
supabase link --project-ref your-project-ref
```

### 3. Set environment variables

You need to set the OpenAI API key as a secret:

```bash
supabase secrets set OPENAI_API_KEY=your-openai-api-key
```

### 4. Deploy the function

```bash
supabase functions deploy analyze-insights
```

## Testing Locally

Run the function locally:

```bash
supabase functions serve analyze-insights
```

Test with curl:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/analyze-insights' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

## How It Works

1. **Authentication**: Validates the user's session token
2. **Data Fetching**: Retrieves the user's journal entries from the last 30 days
3. **Data Preparation**: Formats entries for AI analysis (limits content to avoid token limits)
4. **AI Analysis**: Calls OpenAI GPT-4 to analyze patterns and generate insights
5. **Response**: Returns structured insights including:
   - Summary of emotional state
   - Overall mood score (0-100)
   - Identified trends (positive, neutral, or concerning)
   - Personalized recommendations
   - Emotional breakdown percentages

## Response Format

```json
{
  "insights": {
    "summary": "Brief overview of emotional patterns",
    "moodScore": 75,
    "trends": [
      {
        "title": "Trend name",
        "description": "What was noticed",
        "type": "positive"
      }
    ],
    "recommendations": [
      {
        "title": "Recommendation title",
        "description": "Actionable suggestion",
        "priority": "high"
      }
    ],
    "emotionalBreakdown": {
      "happiness": 45,
      "sadness": 20,
      "anger": 10,
      "fear": 25
    }
  }
}
```

## Cost Considerations

- Uses GPT-4o-mini for cost efficiency
- Limits entry content to 500 characters per entry
- Analyzes max 20 text entries and 10 video entries
- Caches results on client for 1 hour

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `SUPABASE_URL`: Auto-provided by Supabase
- `SUPABASE_ANON_KEY`: Auto-provided by Supabase
