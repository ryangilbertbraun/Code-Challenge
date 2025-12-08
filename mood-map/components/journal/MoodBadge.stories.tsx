import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";
import MoodBadge from "./MoodBadge";

const meta = {
  title: "Journal/MoodBadge",
  component: MoodBadge,
  argTypes: {
    emotion: {
      control: "select",
      options: ["happiness", "sadness", "anger", "fear"],
    },
    value: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
  },
  args: {
    emotion: "happiness",
    value: 0.75,
    size: "medium",
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof MoodBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Happiness: Story = {
  args: {
    emotion: "happiness",
    value: 0.85,
    size: "medium",
  },
};

export const Sadness: Story = {
  args: {
    emotion: "sadness",
    value: 0.45,
    size: "medium",
  },
};

export const Anger: Story = {
  args: {
    emotion: "anger",
    value: 0.3,
    size: "medium",
  },
};

export const Fear: Story = {
  args: {
    emotion: "fear",
    value: 0.6,
    size: "medium",
  },
};

export const SmallSize: Story = {
  args: {
    emotion: "happiness",
    value: 0.75,
    size: "small",
  },
};

export const LargeSize: Story = {
  args: {
    emotion: "happiness",
    value: 0.75,
    size: "large",
  },
};

export const AllEmotions: Story = {
  render: (args) => (
    <View style={{ gap: 12 }}>
      <MoodBadge emotion="happiness" value={0.85} size="medium" />
      <MoodBadge emotion="sadness" value={0.45} size="medium" />
      <MoodBadge emotion="anger" value={0.3} size="medium" />
      <MoodBadge emotion="fear" value={0.6} size="medium" />
    </View>
  ),
  args: {
    emotion: "happiness",
    value: 0.75,
    size: "medium",
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <View style={{ gap: 12 }}>
      <MoodBadge emotion="happiness" value={0.75} size="small" />
      <MoodBadge emotion="happiness" value={0.75} size="medium" />
      <MoodBadge emotion="happiness" value={0.75} size="large" />
    </View>
  ),
  args: {
    emotion: "happiness",
    value: 0.75,
    size: "medium",
  },
};
