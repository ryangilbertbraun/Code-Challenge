import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";
import QuickActions from "./QuickActions";

const meta = {
  title: "Journal/QuickActions",
  component: QuickActions,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof QuickActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onCreateEntry: () =>
      console.log("Create Entry", "Navigate to create entry screen"),
    onViewAll: () => console.log("View All", "Navigate to all entries view"),
  },
};
