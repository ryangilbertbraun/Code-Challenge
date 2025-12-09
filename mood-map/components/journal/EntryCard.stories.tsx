import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";
import EntryCard from "./EntryCard";
import {
  TextEntry,
  VideoEntry,
  EntryType,
  AnalysisStatus,
  Sentiment,
} from "@/types/entry.types";

const meta = {
  title: "Journal/EntryCard",
  component: EntryCard,
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof EntryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const textEntryWithAnalysis: TextEntry = {
  id: "1",
  userId: "user-1",
  type: EntryType.TEXT,
  content:
    "Today was an amazing day! I finally finished my project and got great feedback from my team. Feeling really proud and accomplished.",
  moodMetadata: {
    happiness: 0.85,
    sadness: 0.1,
    anger: 0.05,
    fear: 0.15,
    sentiment: Sentiment.POSITIVE,
  },
  analysisStatus: AnalysisStatus.SUCCESS,
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
};

const textEntryLoading: TextEntry = {
  id: "2",
  userId: "user-1",
  type: EntryType.TEXT,
  content:
    "Just had a difficult conversation with a friend. Not sure how I feel about it yet, but I needed to get it off my chest.",
  moodMetadata: null,
  analysisStatus: AnalysisStatus.LOADING,
  createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  updatedAt: new Date(Date.now() - 5 * 60 * 1000),
};

const textEntryError: TextEntry = {
  id: "3",
  userId: "user-1",
  type: EntryType.TEXT,
  content:
    "Feeling overwhelmed with everything going on. Too many deadlines and not enough time.",
  moodMetadata: null,
  analysisStatus: AnalysisStatus.ERROR,
  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
};

const longTextEntry: TextEntry = {
  id: "4",
  userId: "user-1",
  type: EntryType.TEXT,
  content:
    "This is a really long journal entry that goes on and on about various things that happened throughout the day. I want to test how the preview looks when the text is truncated. There's so much to say about today - the morning started with a beautiful sunrise, then I had breakfast with friends, went for a long walk in the park, and ended the day with a great movie. It was truly wonderful and I'm grateful for all these moments.",
  moodMetadata: {
    happiness: 0.75,
    sadness: 0.2,
    anger: 0.1,
    fear: 0.15,
    sentiment: Sentiment.POSITIVE,
  },
  analysisStatus: AnalysisStatus.SUCCESS,
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
};

const videoEntryWithAnalysis: VideoEntry = {
  id: "5",
  userId: "user-1",
  type: EntryType.VIDEO,
  videoUrl: "https://example.com/video.mp4",
  thumbnailUrl:
    "https://via.placeholder.com/400x300/DCBFC1/FFFFFF?text=Video+Thumbnail",
  duration: 125, // 2:05
  humeEmotionData: {
    face: {
      emotions: [
        { name: "joy", score: 0.82 },
        { name: "surprise", score: 0.45 },
      ],
    },
    prosody: {
      emotions: [
        { name: "excitement", score: 0.75 },
        { name: "contentment", score: 0.68 },
      ],
    },
  },
  analysisStatus: AnalysisStatus.SUCCESS,
  createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
};

const videoEntryLoading: VideoEntry = {
  id: "6",
  userId: "user-1",
  type: EntryType.VIDEO,
  videoUrl: "https://example.com/video2.mp4",
  thumbnailUrl:
    "https://via.placeholder.com/400x300/A8C5E0/FFFFFF?text=Processing...",
  duration: 45,
  humeEmotionData: null,
  analysisStatus: AnalysisStatus.LOADING,
  createdAt: new Date(Date.now() - 30 * 1000), // 30 seconds ago
  updatedAt: new Date(Date.now() - 30 * 1000),
};

const handlePress = () => {
  console.log("Entry Pressed", "This would navigate to the detail view");
};

export const TextWithAnalysis: Story = {
  args: {
    entry: textEntryWithAnalysis,
    onPress: handlePress,
  },
};

export const TextLoading: Story = {
  args: {
    entry: textEntryLoading,
    onPress: handlePress,
  },
};

export const TextError: Story = {
  args: {
    entry: textEntryError,
    onPress: handlePress,
  },
};

export const TextLongContent: Story = {
  args: {
    entry: longTextEntry,
    onPress: handlePress,
  },
};

export const VideoWithAnalysis: Story = {
  args: {
    entry: videoEntryWithAnalysis,
    onPress: handlePress,
  },
};

export const VideoLoading: Story = {
  args: {
    entry: videoEntryLoading,
    onPress: handlePress,
  },
};

export const AllStates: Story = {
  render: (args) => (
    <View style={{ gap: 16 }}>
      <EntryCard entry={textEntryWithAnalysis} onPress={handlePress} />
      <EntryCard entry={textEntryLoading} onPress={handlePress} />
      <EntryCard entry={videoEntryWithAnalysis} onPress={handlePress} />
    </View>
  ),
  args: {
    entry: textEntryWithAnalysis,
    onPress: handlePress,
  },
};
