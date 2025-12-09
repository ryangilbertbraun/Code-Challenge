# MoodMap - AI-Powered Journal Application

<div align="center">

**A modern, privacy-focused journaling app with AI-powered mood analysis**

[Features](#features) • [Architecture](#architecture) • [Setup](#setup) • [Development](#development) • [Testing](#testing)

</div>

---

## Overview

MoodMap is a cross-platform mobile journal application built with React Native and Expo. It combines traditional journaling with AI-powered emotional analysis to help users track and understand their mental wellbeing over time.

### Key Capabilities

- **Text & Video Journaling**: Create entries using text or video recordings
- **AI Mood Analysis**: Automatic emotion detection using OpenAI GPT-4o-mini
- **Video Emotion Analysis**: Facial and vocal emotion detection via Hume AI (temporarily disabled)
- **Smart Filtering**: Filter entries by mood, date, and sentiment
- **AI Insights**: Personalized emotional pattern analysis and recommendations
- **Secure Authentication**: Email/password auth with Supabase
- **Offline Support**: Retry logic with exponential backoff for network resilience

---

## Features

### 1. Authentication

- Email/password registration and login
- Secure session management with Supabase Auth
- Protected routes with AuthGuard
- Automatic session refresh
- Error handling with user-friendly messages

### 2. Journal Entries

#### Text Entries

- Rich text input with real-time character count
- Automatic AI mood analysis on submission
- Emotion scoring: happiness, fear, sadness, anger (0-1 scale)
- Sentiment classification: positive, neutral, negative, mixed
- Optimistic UI updates for instant feedback

#### Video Entries

- In-app video recording with camera controls
- Video upload to Supabase Storage
- Hume AI emotion analysis (facial expressions & voice prosody)
- Video playback with emotion data overlay
- **Note**: Hume integration temporarily disabled pending account resource allocation

### 3. Filtering & Organization

- Filter by mood levels (happiness, fear, sadness, anger)
- Filter by sentiment (positive, neutral, negative, mixed)
- Date range filtering
- Search by content
- Sort by date (newest/oldest)
- Group entries by day/week/month

### 4. AI Insights

- Analyzes last 30 days of entries
- Overall wellbeing score (0-100)
- Emotional breakdown percentages
- Trend detection (positive patterns, concerns)
- Personalized recommendations
- Smart caching (1 hour) to reduce API costs

### 5. Storybook Integration

- Component development environment
- Interactive component showcase
- Visual testing and documentation
- On-device Storybook for mobile testing

---

## Architecture

### Technology Stack

**Frontend**

- **Framework**: React Native 0.81.5 with React 19.1.0
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand (lightweight, performant)
- **UI Components**: Custom components with Expo primitives
- **Animations**: Lottie, React Native Reanimated
- **Testing**: Jest, React Native Testing Library

**Backend**

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (videos, thumbnails)
- **Edge Functions**: Deno-based serverless functions

**AI Services**

- **Text Analysis**: OpenAI GPT-4o-mini
- **Video Analysis**: Hume AI Expression Measurement API
- **Insights**: OpenAI GPT-4o-mini via Supabase Edge Function

### Project Structure

```
mood-map/
├── app/                          # Expo Router pages (file-based routing)
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── index.tsx            # Journal list (home)
│   │   ├── explore.tsx          # AI insights
│   │   └── profile.tsx          # User profile
│   ├── _layout.tsx              # Root layout with navigation
│   ├── auth.tsx                 # Authentication screen
│   ├── create-entry.tsx         # Create new entry
│   └── entry-detail.tsx         # Entry detail view
│
├── components/                   # Reusable UI components
│   ├── auth/                    # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── SignUpForm.tsx
│   │   └── WelcomeSplash.tsx
│   ├── filters/                 # Filter UI components
│   │   ├── FilterBar.tsx
│   │   ├── MoodSlider.tsx
│   │   └── SentimentPicker.tsx
│   ├── journal/                 # Journal-specific components
│   │   ├── EntryCard.tsx
│   │   ├── EntryList.tsx
│   │   └── MoodBadge.tsx
│   ├── ui/                      # Generic UI components
│   │   ├── AlertDialog.tsx
│   │   ├── Button.tsx
│   │   └── LoadingSpinner.tsx
│   └── video/                   # Video recording components
│       ├── VideoRecorder.tsx
│       └── VideoPlayer.tsx
│
├── screens/                      # Screen components
│   ├── AuthScreen.tsx
│   ├── CreateEntryScreen.tsx
│   ├── EntryDetailScreen.tsx
│   ├── JournalListScreen.tsx
│   ├── AIInsightsScreen.tsx
│   └── ProfileScreen.tsx
│
├── services/                     # Business logic & API clients
│   ├── authService.ts           # Authentication operations
│   ├── entryService.ts          # CRUD operations for entries
│   ├── aiService.ts             # OpenAI mood analysis
│   ├── humeService.ts           # Hume video analysis
│   └── insightsService.ts       # AI insights API
│
├── stores/                       # Zustand state management
│   ├── authStore.ts             # Auth state & actions
│   ├── entryStore.ts            # Entry state & actions
│   ├── filterStore.ts           # Filter state & actions
│   └── insightsStore.ts         # Insights state & actions
│
├── types/                        # TypeScript type definitions
│   ├── auth.types.ts
│   ├── entry.types.ts
│   ├── error.types.ts
│   ├── filter.types.ts
│   └── insights.types.ts
│
├── utils/                        # Utility functions
│   ├── supabaseClient.ts        # Supabase client configuration
│   ├── retry.ts                 # Retry logic with exponential backoff
│   ├── filterPipeline.ts        # Entry filtering logic
│   ├── dateGrouping.ts          # Date grouping utilities
│   └── videoProcessing.ts       # Video processing helpers
│
├── hooks/                        # Custom React hooks
│   ├── useAuthErrorHandler.ts   # Auth error handling
│   └── use-theme-color.ts       # Theme utilities
│
├── navigation/                   # Navigation configuration
│   ├── AuthGuard.tsx            # Protected route wrapper
│   └── RootNavigator.tsx        # Root navigation setup
│
├── constants/                    # App constants
│   ├── config.ts                # Environment configuration
│   ├── theme.ts                 # Theme colors & styles
│   └── animations.ts            # Animation configurations
│
├── contexts/                     # React contexts
│   └── AlertContext.tsx         # Global alert system
│
├── __tests__/                    # Test files
│   ├── integration/             # Integration tests
│   │   ├── auth.integration.test.ts
│   │   ├── entries.integration.test.ts
│   │   └── rls.integration.test.ts
│   ├── utils/                   # Test utilities
│   │   ├── testHelpers.ts
│   │   ├── mockServices.ts
│   │   └── fixtures.ts
│   └── setup/                   # Test setup
│       └── setupTests.ts
│
├── supabase/                     # Supabase configuration
│   └── functions/               # Edge functions
│       └── analyze-insights/    # AI insights function
│
├── .storybook/                   # Storybook configuration
│   ├── main.ts
│   ├── preview.tsx
│   └── Storybook.tsx
│
└── assets/                       # Static assets
    ├── images/
    ├── animations/
    └── videos/
```

### Design Patterns

#### 1. Service Layer Pattern

All business logic and external API calls are encapsulated in service classes:

```typescript
// services/entryService.ts
class EntryService implements IEntryService {
  async createTextEntry(content: string): Promise<TextEntry> {
    // Validation, API calls, error handling
  }
}

export const entryService = new EntryService();
```

**Benefits**:

- Separation of concerns
- Easy to mock for testing
- Centralized error handling
- Reusable across components

#### 2. State Management with Zustand

Lightweight, performant state management without boilerplate:

```typescript
// stores/entryStore.ts
export const useEntryStore = create<EntryStore>((set, get) => ({
  entries: [],
  isLoading: false,

  fetchEntries: async () => {
    set({ isLoading: true });
    const entries = await entryService.getEntries();
    set({ entries, isLoading: false });
  },
}));
```

**Benefits**:

- No providers needed
- TypeScript-first
- Minimal re-renders
- Easy to test

#### 3. Error Handling Strategy

Structured error handling with typed error codes:

```typescript
// types/error.types.ts
export enum ErrorCode {
  AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  // ...
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  retryable: boolean;
}
```

**Benefits**:

- Consistent error structure
- User-friendly messages
- Retry logic for transient errors
- Detailed logging for debugging

#### 4. Retry Logic with Exponential Backoff

Network resilience for unreliable connections:

```typescript
// utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  // Retry with exponential backoff
}
```

**Benefits**:

- Handles transient network failures
- Configurable retry attempts
- Exponential backoff prevents server overload
- Used across all network operations

#### 5. Optimistic UI Updates

Immediate feedback for better UX:

```typescript
// stores/entryStore.ts
createTextEntry: async (content: string) => {
  const newEntry = await entryService.createTextEntry(content);

  // Add to UI immediately
  set((state) => ({
    entries: [newEntry, ...state.entries],
  }));

  // Trigger analysis in background
  triggerTextAnalysis(newEntry.id, content);
};
```

**Benefits**:

- Instant user feedback
- Perceived performance improvement
- Background processing doesn't block UI

---

## Coding Practices

### TypeScript Standards

1. **Strict Type Safety**

   - All files use TypeScript with strict mode enabled
   - No `any` types (use `unknown` for truly unknown types)
   - Explicit return types for functions
   - Interface-first design for services

2. **Type Organization**

   - Centralized type definitions in `types/` directory
   - Shared types exported from `types/index.ts`
   - Domain-specific types in separate files

3. **Naming Conventions**
   - PascalCase for components, types, interfaces
   - camelCase for variables, functions
   - UPPER_SNAKE_CASE for constants
   - Prefix interfaces with `I` for service interfaces

### Component Standards

1. **Functional Components**

   - All components use React hooks
   - No class components
   - Custom hooks for reusable logic

2. **Component Structure**

   ```typescript
   // 1. Imports
   import { ... } from '...';

   // 2. Types/Interfaces
   interface ComponentProps {
     // ...
   }

   // 3. Component
   export function Component({ prop }: ComponentProps) {
     // 4. Hooks
     const [state, setState] = useState();

     // 5. Effects
     useEffect(() => {}, []);

     // 6. Handlers
     const handleAction = () => {};

     // 7. Render
     return <View>...</View>;
   }
   ```

3. **Props Destructuring**
   - Always destructure props in function signature
   - Use TypeScript interfaces for prop types

### Service Layer Standards

1. **Interface-First Design**

   ```typescript
   export interface IEntryService {
     createTextEntry(content: string): Promise<TextEntry>;
     getEntries(): Promise<JournalEntry[]>;
   }

   class EntryService implements IEntryService {
     // Implementation
   }
   ```

2. **Singleton Pattern**

   - Export singleton instances for services
   - Prevents multiple API client instances

3. **Error Handling**
   - All service methods throw `AppError`
   - Map external errors to `AppError` format
   - Include retry logic for network operations

### State Management Standards

1. **Zustand Store Structure**

   ```typescript
   interface Store {
     // State
     data: Data[];
     isLoading: boolean;
     error: string | null;

     // Actions
     fetchData: () => Promise<void>;
     clearError: () => void;
   }
   ```

2. **Async Actions**

   - Set loading state before async operations
   - Handle errors gracefully
   - Clear loading state in finally block

3. **Immutable Updates**
   - Use functional updates: `set((state) => ({ ... }))`
   - Never mutate state directly

### Testing Standards

1. **Test Organization**

   - Unit tests colocated with source: `__tests__/`
   - Integration tests in `__tests__/integration/`
   - Test utilities in `__tests__/utils/`

2. **Test Structure**

   ```typescript
   describe("ComponentName", () => {
     it("should do something", () => {
       // Arrange
       // Act
       // Assert
     });
   });
   ```

3. **Mocking**
   - Mock external services
   - Use test fixtures for data
   - Mock Supabase client for integration tests

### Code Quality

1. **ESLint Configuration**

   - Expo's recommended ESLint config
   - React hooks rules enforced
   - Import order rules

2. **Code Comments**

   - JSDoc comments for public APIs
   - Inline comments for complex logic
   - TODO comments with context

3. **File Organization**
   - One component per file
   - Related components in subdirectories
   - Index files for clean imports

---

## AI Integration

### OpenAI (Text Mood Analysis)

**Model**: GPT-4o-mini  
**Purpose**: Analyze journal text for emotional content  
**Cost**: ~$0.0001-0.0002 per entry

**Implementation**:

```typescript
// services/aiService.ts
async analyzeMood(text: string): Promise<MoodMetadata> {
  const response = await this.openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an emotional analysis assistant..." },
      { role: "user", content: MOOD_ANALYSIS_PROMPT.replace("{entry_text}", text) }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  // Parse and validate response
  return normalizedMoodData;
}
```

**Prompt Engineering**:

- System message defines role and output format
- User message includes structured prompt template
- JSON mode ensures parseable responses
- Low temperature (0.3) for consistent results

**Output Format**:

```json
{
  "happiness": 0.75,
  "fear": 0.1,
  "sadness": 0.2,
  "anger": 0.05,
  "sentiment": "positive"
}
```

### Hume AI (Video Emotion Analysis)

**API**: Expression Measurement API  
**Purpose**: Analyze facial expressions and voice prosody in videos  
**Status**: ⚠️ **Temporarily Disabled**

**Why Disabled**:
Hume videos are currently queued and not returning analysis data. The integration is complete and tested, but disabled until Hume allocates resources to the account.

**Implementation** (when enabled):

```typescript
// services/humeService.ts
async analyzeVideoByUrl(videoUrl: string): Promise<HumeEmotionData> {
  // Step 1: Submit job to Hume API
  const jobId = await this.submitHumeJob(videoUrl);

  // Step 2: Poll for results
  const emotionData = await this.pollForResults(jobId);

  return emotionData;
}
```

**Architecture**:

1. Video uploaded to Supabase Storage
2. Public URL submitted to Hume API
3. Job ID stored in database
4. Polling checks job status (max 2 minutes)
5. Results stored when complete

**Output Format**:

```json
{
  "face": {
    "emotions": [
      { "name": "Joy", "score": 0.85 },
      { "name": "Sadness", "score": 0.12 }
    ]
  },
  "prosody": {
    "emotions": [{ "name": "Excitement", "score": 0.72 }]
  }
}
```

**Re-enabling Hume**:
When Hume processes queued videos, simply change one line:

```typescript
// constants/config.ts
export const config = {
  hume: {
    apiKey: process.env.EXPO_PUBLIC_HUME_API_KEY || "",
    enabled: true, // Change from false to true
  },
};
```

**Features**:

- Async job submission (non-blocking)
- Status polling on-demand (when user views entry)
- Retry logic with exponential backoff
- Graceful degradation if analysis fails

---

## Setup

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Supabase account
- OpenAI API key
- Hume AI API key (optional, currently disabled)

### Installation

1. **Clone the repository**

   ```bash
   cd mood-map
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   The `.env` file is already configured with the necessary API keys and Supabase credentials. The database and backend services are already set up and running.

### Running the App

**Development Mode**:

```bash
npm start
```

Then press:

- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

**Storybook Mode**:

```bash
npm run storybook
```

**Run Tests**:

```bash
npm test
```

**Run Integration Tests**:

```bash
npm run test:integration
```

---

## Development

### Adding a New Feature

1. **Define Types**

   ```typescript
   // types/feature.types.ts
   export interface Feature {
     id: string;
     name: string;
   }
   ```

2. **Create Service**

   ```typescript
   // services/featureService.ts
   export interface IFeatureService {
     getFeature(id: string): Promise<Feature>;
   }

   class FeatureService implements IFeatureService {
     async getFeature(id: string): Promise<Feature> {
       // Implementation
     }
   }

   export const featureService = new FeatureService();
   ```

3. **Create Store**

   ```typescript
   // stores/featureStore.ts
   interface FeatureStore {
     feature: Feature | null;
     fetchFeature: (id: string) => Promise<void>;
   }

   export const useFeatureStore = create<FeatureStore>((set) => ({
     feature: null,
     fetchFeature: async (id) => {
       const feature = await featureService.getFeature(id);
       set({ feature });
     },
   }));
   ```

4. **Create Component**

   ```typescript
   // components/feature/FeatureCard.tsx
   export function FeatureCard({ feature }: { feature: Feature }) {
     return <View>...</View>;
   }
   ```

5. **Create Screen**

   ```typescript
   // screens/FeatureScreen.tsx
   export function FeatureScreen() {
     const { feature, fetchFeature } = useFeatureStore();

     useEffect(() => {
       fetchFeature("id");
     }, []);

     return <FeatureCard feature={feature} />;
   }
   ```

6. **Add Route**

   ```typescript
   // app/feature.tsx
   export default function FeaturePage() {
     return <FeatureScreen />;
   }
   ```

7. **Write Tests**
   ```typescript
   // __tests__/integration/feature.test.ts
   describe("Feature", () => {
     it("should fetch feature", async () => {
       // Test implementation
     });
   });
   ```

### Debugging

**React Native Debugger**:

```bash
# Install
brew install --cask react-native-debugger

# Run
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

**Expo Dev Tools**:

- Press `m` in terminal to open menu
- Press `j` to open debugger

**Logging**:

```typescript
console.log("Debug info");
console.error("Error info");
console.warn("Warning info");
```

### Performance Optimization

1. **Memoization**

   ```typescript
   const MemoizedComponent = React.memo(Component);
   const memoizedValue = useMemo(() => computeValue(), [deps]);
   const memoizedCallback = useCallback(() => {}, [deps]);
   ```

2. **Lazy Loading**

   ```typescript
   const LazyComponent = React.lazy(() => import("./Component"));
   ```

3. **FlatList Optimization**
   ```typescript
   <FlatList
     data={items}
     renderItem={renderItem}
     keyExtractor={(item) => item.id}
     removeClippedSubviews={true}
     maxToRenderPerBatch={10}
     windowSize={10}
   />
   ```

---

## Testing

### Test Structure

```
__tests__/
├── integration/              # Integration tests
│   ├── auth.integration.test.ts
│   ├── entries.integration.test.ts
│   └── rls.integration.test.ts
├── utils/                    # Test utilities
│   ├── testHelpers.ts       # Helper functions
│   ├── mockServices.ts      # Service mocks
│   └── fixtures.ts          # Test data
└── setup/                    # Test setup
    └── setupTests.ts        # Global test configuration
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run with coverage
npm test -- --coverage
```

### Writing Tests

**Component Test**:

```typescript
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../Button";

describe("Button", () => {
  it("should call onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Click</Button>);

    fireEvent.press(getByText("Click"));

    expect(onPress).toHaveBeenCalled();
  });
});
```

**Integration Test**:

```typescript
import { renderHook, act } from "@testing-library/react-hooks";
import { useEntryStore } from "../stores/entryStore";

describe("Entry Store", () => {
  it("should fetch entries", async () => {
    const { result } = renderHook(() => useEntryStore());

    await act(async () => {
      await result.current.fetchEntries();
    });

    expect(result.current.entries).toHaveLength(2);
  });
});
```

---

## Deployment

### Building for Production

**iOS**:

```bash
eas build --platform ios
```

**Android**:

```bash
eas build --platform android
```

### Environment Variables

Production environment variables should be set in EAS:

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value your_value
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your_value
eas secret:create --name EXPO_PUBLIC_OPENAI_API_KEY --value your_value
```

---

## Troubleshooting

### Common Issues

**1. Supabase Connection Errors**

- Verify `.env` file has correct credentials
- Check Supabase project is active
- Verify RLS policies are configured

**2. OpenAI API Errors**

- Verify API key is valid
- Check API quota/billing
- Ensure network connectivity

**3. Video Upload Failures**

- Check Supabase storage bucket exists
- Verify storage RLS policies
- Check file size limits

**4. Hume Analysis Not Working**

- Hume is currently disabled (see config.ts)
- Will be re-enabled when account resources are allocated
- Videos still upload successfully

### Getting Help

- Check existing documentation in `/mood-map/*.md` files
- Review Storybook for component examples
- Check test files for usage examples
- Review Supabase logs for backend errors

---

## Contributing

### Code Style

- Follow existing patterns and conventions
- Write TypeScript with strict types
- Add tests for new features
- Update documentation

### Pull Request Process

1. Create feature branch from `main`
2. Implement feature with tests
3. Update documentation
4. Submit PR with description

---

## License

This project was created as part of a code challenge for Mindful Software.

---

## Acknowledgments

- **Expo** - React Native framework
- **Supabase** - Backend infrastructure
- **OpenAI** - Text mood analysis
- **Hume AI** - Video emotion analysis (pending activation)
- **Zustand** - State management
- **React Native Testing Library** - Testing utilities

---

**Built with ❤️ for mental wellness tracking**
