import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View, Alert } from "react-native";
import VideoRecorder from "./VideoRecorder";

const meta = {
  title: "Video/VideoRecorder",
  component: VideoRecorder,
  decorators: [
    (Story) => (
      <View style={{ flex: 1 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof VideoRecorder>;

export default meta;

type Story = StoryObj<typeof meta>;

const handleRecordingComplete = (
  videoUri: string,
  thumbnailUri: string,
  duration: number
) => {
  Alert.alert(
    "Recording Complete",
    `Video recorded successfully!\nDuration: ${duration}s\nURI: ${videoUri}`
  );
};

const handleCancel = () => {
  Alert.alert("Cancelled", "Recording cancelled");
};

/**
 * Default VideoRecorder with standard settings
 */
export const Default: Story = {
  args: {
    onRecordingComplete: handleRecordingComplete,
    onCancel: handleCancel,
    maxDuration: 120,
  },
};

/**
 * VideoRecorder with short max duration (30 seconds)
 */
export const ShortDuration: Story = {
  args: {
    onRecordingComplete: handleRecordingComplete,
    onCancel: handleCancel,
    maxDuration: 30,
  },
};

/**
 * VideoRecorder with long max duration (5 minutes)
 */
export const LongDuration: Story = {
  args: {
    onRecordingComplete: handleRecordingComplete,
    onCancel: handleCancel,
    maxDuration: 300,
  },
};

/**
 * VideoRecorder without cancel handler
 */
export const NoCancel: Story = {
  args: {
    onRecordingComplete: handleRecordingComplete,
    maxDuration: 120,
  },
};
