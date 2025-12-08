import type { Meta, StoryObj } from "@storybook/react-native";
import React, { useState } from "react";
import { View } from "react-native";
import EmotionSlider from "./EmotionSlider";
import { EmotionRange } from "@/types/filter.types";

/**
 * EmotionSlider allows users to filter journal entries by selecting
 * an emotion range (0-1) using dual sliders for min and max values.
 */

// Wrapper component to handle state
const EmotionSliderWithState = (props: {
  emotion: "happiness" | "fear" | "sadness" | "anger";
  range: EmotionRange;
}) => {
  const [range, setRange] = useState(props.range);
  return (
    <EmotionSlider
      emotion={props.emotion}
      range={range}
      onRangeChange={setRange}
    />
  );
};

const meta = {
  title: "Filters/EmotionSlider",
  component: EmotionSliderWithState,
  argTypes: {
    emotion: {
      control: "select",
      options: ["happiness", "sadness", "anger", "fear"],
    },
  },
  args: {
    emotion: "happiness",
    range: { min: 0.0, max: 1.0 },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof EmotionSliderWithState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Happiness: Story = {
  args: {
    emotion: "happiness",
    range: { min: 0.0, max: 1.0 },
  },
};

export const Sadness: Story = {
  args: {
    emotion: "sadness",
    range: { min: 0.0, max: 1.0 },
  },
};

export const Anger: Story = {
  args: {
    emotion: "anger",
    range: { min: 0.0, max: 1.0 },
  },
};

export const Fear: Story = {
  args: {
    emotion: "fear",
    range: { min: 0.0, max: 1.0 },
  },
};

export const WithCustomRange: Story = {
  args: {
    emotion: "happiness",
    range: { min: 0.3, max: 0.8 },
  },
};

export const AllEmotions: Story = {
  render: () => (
    <View>
      <EmotionSliderWithState
        emotion="happiness"
        range={{ min: 0.0, max: 1.0 }}
      />
      <EmotionSliderWithState
        emotion="sadness"
        range={{ min: 0.0, max: 1.0 }}
      />
      <EmotionSliderWithState emotion="anger" range={{ min: 0.0, max: 1.0 }} />
      <EmotionSliderWithState emotion="fear" range={{ min: 0.0, max: 1.0 }} />
    </View>
  ),
  args: {
    emotion: "happiness",
    range: { min: 0.0, max: 1.0 },
  },
};
