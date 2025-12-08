import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";
import TextEntryDetail from "./TextEntryDetail";
import {
  TextEntry,
  EntryType,
  AnalysisStatus,
  Sentiment,
} from "@/types/entry.types";

const meta = {
  title: "Journal/TextEntryDetail",
  component: TextEntryDetail,
  decorators: [
    (Story) => (
      <View style={{ flex: 1 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof TextEntryDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

const successEntry: TextEntry = {
  id: "1",
  userId: "user-1",
  type: EntryType.TEXT,
  content:
    "Today was absolutely wonderful! I woke up early and went for a run in the park. The weather was perfect - sunny but not too hot. After my run, I had a delicious breakfast and spent some time reading a book I've been meaning to finish.\n\nIn the afternoon, I met up with some friends for coffee and we had such a great conversation. We talked about our dreams, our goals, and all the exciting things happening in our lives. It felt so good to connect with people who truly understand and support me.\n\nI'm ending the day feeling grateful, energized, and optimistic about the future. These are the moments that make life beautiful.",
  moodMetadata: {
    happiness: 0.88,
    sadness: 0.08,
    anger: 0.05,
    fear: 0.12,
    sentiment: Sentiment.POSITIVE,
  },
  analysisStatus: AnalysisStatus.SUCCESS,
  createdAt: new Date(2024, 11, 8, 18, 30),
  updatedAt: new Date(2024, 11, 8, 18, 30),
};

const loadingEntry: TextEntry = {
  id: "2",
  userId: "user-1",
  type: EntryType.TEXT,
  content:
    "Just finished a really challenging work presentation. My heart is still racing! I was so nervous beforehand, but I think it went well. My manager seemed pleased with the results and asked some good questions.\n\nNow I'm trying to decompress and process everything that happened. It's interesting how much energy these high-stakes situations take.",
  moodMetadata: null,
  analysisStatus: AnalysisStatus.LOADING,
  createdAt: new Date(2024, 11, 8, 15, 45),
  updatedAt: new Date(2024, 11, 8, 15, 45),
};

const errorEntry: TextEntry = {
  id: "3",
  userId: "user-1",
  type: EntryType.TEXT,
  content:
    "Feeling really frustrated today. Nothing seems to be going right. Work is stressful, I'm behind on my personal projects, and I just feel overwhelmed by everything.\n\nI know this feeling will pass, but right now it's hard to see the light at the end of the tunnel. I'm trying to be patient with myself and remember that it's okay to have difficult days.",
  moodMetadata: null,
  analysisStatus: AnalysisStatus.ERROR,
  createdAt: new Date(2024, 11, 7, 21, 15),
  updatedAt: new Date(2024, 11, 7, 21, 15),
};

const pendingEntry: TextEntry = {
  id: "4",
  userId: "user-1",
  type: EntryType.TEXT,
  content:
    "Quick note before bed - today was pretty average. Nothing particularly exciting or upsetting happened. Just a normal day of work, errands, and relaxing at home.",
  moodMetadata: null,
  analysisStatus: AnalysisStatus.PENDING,
  createdAt: new Date(2024, 11, 8, 22, 0),
  updatedAt: new Date(2024, 11, 8, 22, 0),
};

const mixedEmotionsEntry: TextEntry = {
  id: "5",
  userId: "user-1",
  type: EntryType.TEXT,
  content:
    "Today was bittersweet. I said goodbye to a colleague who's moving to a new city for an amazing opportunity. I'm so happy for them and excited about their new adventure, but I'm also sad that we won't be working together anymore.\n\nIt's strange how you can feel multiple emotions at once - joy for someone else's success mixed with sadness about the change. Life is full of these complex moments.",
  moodMetadata: {
    happiness: 0.55,
    sadness: 0.62,
    anger: 0.08,
    fear: 0.25,
    sentiment: Sentiment.MIXED,
  },
  analysisStatus: AnalysisStatus.SUCCESS,
  createdAt: new Date(2024, 11, 6, 17, 20),
  updatedAt: new Date(2024, 11, 6, 17, 20),
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

export const MixedEmotions: Story = {
  args: {
    entry: mixedEmotionsEntry,
  },
};
