import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View, ScrollView } from "react-native";
import VideoPlayer from "./VideoPlayer";

const meta = {
  title: "Video/VideoPlayer",
  component: VideoPlayer,
  decorators: [
    (Story) => (
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          <Story />
        </View>
      </ScrollView>
    ),
  ],
} satisfies Meta<typeof VideoPlayer>;

export default meta;

type Story = StoryObj<typeof meta>;

// Sample video URLs (using Big Buck Bunny test video)
const SAMPLE_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const SAMPLE_THUMBNAIL_URL =
  "https://via.placeholder.com/640x360/DCBFC1/FFFFFF?text=Video+Thumbnail";

/**
 * Default VideoPlayer with controls
 */
export const Default: Story = {
  args: {
    videoUri: SAMPLE_VIDEO_URL,
    thumbnailUri: SAMPLE_THUMBNAIL_URL,
    autoPlay: false,
    showControls: true,
  },
};

/**
 * VideoPlayer with autoplay enabled
 */
export const AutoPlay: Story = {
  args: {
    videoUri: SAMPLE_VIDEO_URL,
    thumbnailUri: SAMPLE_THUMBNAIL_URL,
    autoPlay: true,
    showControls: true,
  },
};

/**
 * VideoPlayer without controls
 */
export const NoControls: Story = {
  args: {
    videoUri: SAMPLE_VIDEO_URL,
    thumbnailUri: SAMPLE_THUMBNAIL_URL,
    autoPlay: false,
    showControls: false,
  },
};

/**
 * VideoPlayer with custom styling
 */
export const CustomStyle: Story = {
  args: {
    videoUri: SAMPLE_VIDEO_URL,
    thumbnailUri: SAMPLE_THUMBNAIL_URL,
    autoPlay: false,
    showControls: true,
    style: {
      borderRadius: 24,
      borderWidth: 2,
      borderColor: "#DCBFC1",
    },
  },
};

/**
 * Multiple VideoPlayers in a list
 */
export const MultipleVideos: Story = {
  render: (args) => (
    <View style={{ gap: 20 }}>
      <VideoPlayer
        videoUri={SAMPLE_VIDEO_URL}
        thumbnailUri={SAMPLE_THUMBNAIL_URL}
        autoPlay={false}
        showControls={true}
      />
      <VideoPlayer
        videoUri={SAMPLE_VIDEO_URL}
        thumbnailUri={SAMPLE_THUMBNAIL_URL}
        autoPlay={false}
        showControls={true}
      />
    </View>
  ),
  args: {
    videoUri: SAMPLE_VIDEO_URL,
    thumbnailUri: SAMPLE_THUMBNAIL_URL,
    autoPlay: false,
    showControls: true,
  },
};
