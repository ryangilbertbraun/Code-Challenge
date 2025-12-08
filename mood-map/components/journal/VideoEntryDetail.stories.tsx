import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";
import VideoEntryDetail from "./VideoEntryDetail";
import { VideoEntry, EntryType, AnalysisStatus } from "@/types/entry.types";

const meta = {
  title: "Journal/VideoEntryDetail",
  component: VideoEntryDetail,
  decorators: [
    (Story) => (
      <View style={{ flex: 1 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof VideoEntryDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

const successEntry: VideoEntry = {
  id: "1",
  userId: "user-1",
  type: EntryType.VIDEO,
  videoUrl:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  thumbnailUrl:
    "https://via.placeholder.com/640x360/DCBFC1/FFFFFF?text=Happy+Moment",
  duration: 125, // 2:05
  humeEmotionData: {
    face: {
      emotions: [
        { name: "joy", score: 0.82 },
        { name: "surprise", score: 0.45 },
        { name: "contentment", score: 0.68 },
        { name: "excitement", score: 0.55 },
        { name: "amusement", score: 0.48 },
      ],
    },
    prosody: {
      emotions: [
        { name: "excitement", score: 0.75 },
        { name: "contentment", score: 0.68 },
        { name: "joy", score: 0.62 },
        { name: "enthusiasm", score: 0.58 },
        { name: "satisfaction", score: 0.52 },
      ],
    },
  },
  analysisStatus: AnalysisStatus.SUCCESS,
  createdAt: new Date(2024, 11, 8, 14, 30),
  updatedAt: new Date(2024, 11, 8, 14, 30),
};

const loadingEntry: VideoEntry = {
  id: "2",
  userId: "user-1",
  type: EntryType.VIDEO,
  videoUrl:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  thumbnailUrl:
    "https://via.placeholder.com/640x360/A8C5E0/FFFFFF?text=Processing...",
  duration: 45,
  humeEmotionData: null,
  analysisStatus: AnalysisStatus.LOADING,
  createdAt: new Date(2024, 11, 8, 16, 15),
  updatedAt: new Date(2024, 11, 8, 16, 15),
};

const errorEntry: VideoEntry = {
  id: "3",
  userId: "user-1",
  type: EntryType.VIDEO,
  videoUrl:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  thumbnailUrl:
    "https://via.placeholder.com/640x360/E8B4B4/FFFFFF?text=Analysis+Failed",
  duration: 90,
  humeEmotionData: null,
  analysisStatus: AnalysisStatus.ERROR,
  createdAt: new Date(2024, 11, 7, 19, 45),
  updatedAt: new Date(2024, 11, 7, 19, 45),
};

const pendingEntry: VideoEntry = {
  id: "4",
  userId: "user-1",
  type: EntryType.VIDEO,
  videoUrl:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  thumbnailUrl:
    "https://via.placeholder.com/640x360/D4D4D4/FFFFFF?text=Pending",
  duration: 60,
  humeEmotionData: null,
  analysisStatus: AnalysisStatus.PENDING,
  createdAt: new Date(2024, 11, 8, 18, 0),
  updatedAt: new Date(2024, 11, 8, 18, 0),
};

const complexEmotionsEntry: VideoEntry = {
  id: "5",
  userId: "user-1",
  type: EntryType.VIDEO,
  videoUrl:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  thumbnailUrl:
    "https://via.placeholder.com/640x360/D9C4E0/FFFFFF?text=Complex+Emotions",
  duration: 180, // 3:00
  humeEmotionData: {
    face: {
      emotions: [
        { name: "sadness", score: 0.72 },
        { name: "contemplation", score: 0.65 },
        { name: "concern", score: 0.58 },
        { name: "determination", score: 0.52 },
        { name: "hope", score: 0.45 },
        { name: "anxiety", score: 0.38 },
        { name: "nostalgia", score: 0.35 },
      ],
    },
    prosody: {
      emotions: [
        { name: "melancholy", score: 0.68 },
        { name: "reflection", score: 0.62 },
        { name: "seriousness", score: 0.58 },
        { name: "calmness", score: 0.48 },
        { name: "uncertainty", score: 0.42 },
      ],
    },
  },
  analysisStatus: AnalysisStatus.SUCCESS,
  createdAt: new Date(2024, 11, 6, 20, 10),
  updatedAt: new Date(2024, 11, 6, 20, 10),
};

const faceOnlyEntry: VideoEntry = {
  id: "6",
  userId: "user-1",
  type: EntryType.VIDEO,
  videoUrl:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  thumbnailUrl:
    "https://via.placeholder.com/640x360/B8DCC8/FFFFFF?text=Face+Only",
  duration: 95,
  humeEmotionData: {
    face: {
      emotions: [
        { name: "concentration", score: 0.78 },
        { name: "interest", score: 0.65 },
        { name: "curiosity", score: 0.52 },
      ],
    },
  },
  analysisStatus: AnalysisStatus.SUCCESS,
  createdAt: new Date(2024, 11, 5, 15, 30),
  updatedAt: new Date(2024, 11, 5, 15, 30),
};

export const WithAnalysis: Story = {
  args: {
    entry: successEntry,
  },
};

export const Loading: Story = {
  args: {
    entry: loadingEntry,
  },
};

export const Error: Story = {
  args: {
    entry: errorEntry,
  },
};

export const Pending: Story = {
  args: {
    entry: pendingEntry,
  },
};

export const ComplexEmotions: Story = {
  args: {
    entry: complexEmotionsEntry,
  },
};

export const FaceEmotionsOnly: Story = {
  args: {
    entry: faceOnlyEntry,
  },
};
