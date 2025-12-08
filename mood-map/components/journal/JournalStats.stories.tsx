import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";
import JournalStats from "./JournalStats";
import { JournalEntry } from "@/types/entry.types";

const meta = {
  title: "Journal/JournalStats",
  component: JournalStats,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof JournalStats>;

export default meta;

type Story = StoryObj<typeof meta>;

const createMockEntry = (
  daysAgo: number,
  type: "text" | "video"
): JournalEntry => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    id: `entry-${daysAgo}-${type}`,
    userId: "user-1",
    type,
    content: "Mock entry",
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
  };
};

export const Default: Story = {
  args: {
    entries: [
      createMockEntry(0, "text"),
      createMockEntry(1, "video"),
      createMockEntry(3, "text"),
      createMockEntry(5, "video"),
      createMockEntry(10, "text"),
      createMockEntry(15, "video"),
      createMockEntry(20, "text"),
      createMockEntry(25, "video"),
    ],
  },
};

export const NoEntries: Story = {
  args: {
    entries: [],
  },
};

export const VeryActive: Story = {
  args: {
    entries: Array.from({ length: 50 }, (_, i) =>
      createMockEntry(i, i % 2 === 0 ? "text" : "video")
    ),
  },
};

export const OnlyThisWeek: Story = {
  args: {
    entries: [
      createMockEntry(0, "text"),
      createMockEntry(1, "video"),
      createMockEntry(2, "text"),
      createMockEntry(3, "video"),
      createMockEntry(4, "text"),
    ],
  },
};
