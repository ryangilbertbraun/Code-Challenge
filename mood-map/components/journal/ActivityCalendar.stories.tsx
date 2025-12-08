import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";
import ActivityCalendar from "./ActivityCalendar";
import { JournalEntry } from "@/types/entry.types";

const meta = {
  title: "Journal/ActivityCalendar",
  component: ActivityCalendar,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ActivityCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

// Helper to create mock entries
const createMockEntries = (dates: Date[]): JournalEntry[] => {
  return dates.map((date, index) => ({
    id: `entry-${index}`,
    userId: "user-1",
    type: index % 2 === 0 ? "text" : "video",
    content: "Mock entry content",
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
  }));
};

// Generate entries for current month with varying frequency
const generateMonthEntries = (): JournalEntry[] => {
  const now = new Date();
  const entries: Date[] = [];

  // Add some entries throughout the month
  for (let i = 1; i <= 28; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), i);
    // Random pattern: more entries on some days
    if (i % 3 === 0) {
      entries.push(date);
      if (i % 6 === 0) {
        entries.push(date); // 2 entries
      }
      if (i % 9 === 0) {
        entries.push(date); // 3 entries
      }
    }
  }

  return createMockEntries(entries);
};

export const Default: Story = {
  args: {
    entries: generateMonthEntries(),
  },
};

export const EmptyMonth: Story = {
  args: {
    entries: [],
  },
};

export const VeryActive: Story = {
  args: {
    entries: createMockEntries(
      Array.from({ length: 60 }, (_, i) => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), (i % 28) + 1);
      })
    ),
  },
};

export const FewEntries: Story = {
  args: {
    entries: createMockEntries([
      new Date(new Date().getFullYear(), new Date().getMonth(), 5),
      new Date(new Date().getFullYear(), new Date().getMonth(), 12),
      new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    ]),
  },
};
