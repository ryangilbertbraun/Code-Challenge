import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";
import EmotionVisualization from "./EmotionVisualization";
import { MoodMetadata, Sentiment } from "@/types/entry.types";

const meta = {
  title: "Journal/EmotionVisualization",
  component: EmotionVisualization,
  argTypes: {
    variant: {
      control: "select",
      options: ["compact", "detailed"],
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof EmotionVisualization>;

export default meta;

type Story = StoryObj<typeof meta>;

const positiveMood: MoodMetadata = {
  happiness: 0.85,
  sadness: 0.15,
  anger: 0.1,
  fear: 0.2,
  sentiment: Sentiment.POSITIVE,
};

const negativeMood: MoodMetadata = {
  happiness: 0.2,
  sadness: 0.7,
  anger: 0.6,
  fear: 0.5,
  sentiment: Sentiment.NEGATIVE,
};

const neutralMood: MoodMetadata = {
  happiness: 0.5,
  sadness: 0.4,
  anger: 0.3,
  fear: 0.4,
  sentiment: Sentiment.NEUTRAL,
};

const mixedMood: MoodMetadata = {
  happiness: 0.6,
  sadness: 0.5,
  anger: 0.4,
  fear: 0.3,
  sentiment: Sentiment.MIXED,
};

export const PositiveDetailed: Story = {
  args: {
    moodMetadata: positiveMood,
    variant: "detailed",
  },
};

export const NegativeDetailed: Story = {
  args: {
    moodMetadata: negativeMood,
    variant: "detailed",
  },
};

export const NeutralDetailed: Story = {
  args: {
    moodMetadata: neutralMood,
    variant: "detailed",
  },
};

export const MixedDetailed: Story = {
  args: {
    moodMetadata: mixedMood,
    variant: "detailed",
  },
};

export const PositiveCompact: Story = {
  args: {
    moodMetadata: positiveMood,
    variant: "compact",
  },
};

export const NegativeCompact: Story = {
  args: {
    moodMetadata: negativeMood,
    variant: "compact",
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <View style={{ gap: 24 }}>
      <EmotionVisualization moodMetadata={positiveMood} variant="detailed" />
      <EmotionVisualization moodMetadata={positiveMood} variant="compact" />
    </View>
  ),
  args: {
    moodMetadata: positiveMood,
    variant: "detailed",
  },
};
