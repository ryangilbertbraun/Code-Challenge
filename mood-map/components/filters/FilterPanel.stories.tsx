import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";
import FilterPanel from "./FilterPanel";

/**
 * FilterPanel is the main container for all filter controls.
 * It provides a comprehensive interface for filtering journal entries
 * by emotion, type, and search text, with a clear filters button.
 */

const meta = {
  title: "Filters/FilterPanel",
  component: FilterPanel,
  args: {},
  decorators: [
    (Story) => (
      <View style={{ flex: 1 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof FilterPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
