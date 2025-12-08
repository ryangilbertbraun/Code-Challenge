# MoodMap Features

## AI Insights (New!)

A personalized AI analysis feature that provides insights about user's emotional patterns based on their journal entries.

### What It Does

- **Analyzes Recent Entries**: Reviews the last 30 days of text and video journal entries
- **Mood Score**: Provides an overall wellbeing score (0-100)
- **Emotional Breakdown**: Shows percentage distribution of emotions (happiness, sadness, anger, fear)
- **Trend Detection**: Identifies positive patterns, neutral observations, and areas of concern
- **Personalized Recommendations**: Offers actionable suggestions based on emotional patterns
- **Smart Caching**: Caches results for 1 hour to reduce API costs

### How to Access

1. Open the app
2. Navigate to the **Insights** tab (lightbulb icon)
3. Pull down to refresh for latest analysis

### Technical Implementation

- **Frontend**: React Native screen with Zustand state management
- **Backend**: Supabase Edge Function (Deno)
- **AI**: OpenAI GPT-4o-mini for cost-effective analysis
- **Security**: User authentication required, data isolated per user

### Files Added

```
mood-map/
├── supabase/functions/analyze-insights/
│   ├── index.ts                    # Edge function for AI analysis
│   └── README.md                   # Deployment guide
├── screens/
│   └── AIInsightsScreen.tsx        # Main insights UI
├── services/
│   └── insightsService.ts          # API service layer
├── stores/
│   └── insightsStore.ts            # State management
├── types/
│   └── insights.types.ts           # TypeScript types
└── app/(tabs)/
    └── explore.tsx                 # Updated to show insights

Documentation:
├── AI_INSIGHTS_SETUP.md            # Setup and deployment guide
└── FEATURES.md                     # This file
```

### Setup Required

See `AI_INSIGHTS_SETUP.md` for detailed setup instructions. Quick summary:

1. Get OpenAI API key
2. Set as Supabase secret: `supabase secrets set OPENAI_API_KEY=...`
3. Deploy function: `supabase functions deploy analyze-insights`

### Cost Estimate

- ~$0.01-0.02 per analysis
- With caching: ~$60-120/month for 100 active users

## Other Features

### Journal Entries

- Text entries with AI mood analysis
- Video entries with Hume emotion detection
- Entry list with filtering and search

### Authentication

- Email/password authentication
- Secure session management
- Protected routes

### Video Recording

- In-app video recording
- Emotion analysis via Hume AI
- Video playback with emotion data

### Mood Tracking

- Automatic mood detection from text
- Emotion scoring (happiness, fear, sadness, anger)
- Sentiment classification
