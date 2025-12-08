import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";
import WelcomeHeader from "./WelcomeHeader";

const meta = {
  title: "Journal/WelcomeHeader",
  component: WelcomeHeader,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof WelcomeHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoEntries: Story = {
  args: {
    totalEntries: 0,
  },
};

export const FirstEntry: Story = {
  args: {
    totalEntries: 1,
  },
};

export const FewEntries: Story = {
  args: {
    totalEntries: 5,
  },
};

export const ManyEntries: Story = {
  args: {
    totalEntries: 50,
  },
};
