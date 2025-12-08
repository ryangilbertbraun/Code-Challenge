import type { Meta, StoryObj } from "@storybook/react-native";
import React, { useState } from "react";
import { View, Text } from "react-native";
import TypeFilter from "./TypeFilter";
import { EntryType } from "@/types/entry.types";
import { colors, typography } from "@/constants/theme";

/**
 * TypeFilter allows users to filter journal entries by type
 * (text, video, or both) using toggle buttons.
 */

// Wrapper component to handle state
const TypeFilterWithState = (props: { initialTypes: EntryType[] }) => {
  const [selectedTypes, setSelectedTypes] = useState(props.initialTypes);
  return (
    <View>
      <TypeFilter
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
      />
      <Text
        style={{
          marginTop: 12,
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        }}
      >
        Selected: {selectedTypes.join(", ")}
      </Text>
    </View>
  );
};

const meta = {
  title: "Filters/TypeFilter",
  component: TypeFilterWithState,
  args: {
    initialTypes: [EntryType.TEXT, EntryType.VIDEO],
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof TypeFilterWithState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BothSelected: Story = {
  args: {
    initialTypes: [EntryType.TEXT, EntryType.VIDEO],
  },
};

export const TextOnly: Story = {
  args: {
    initialTypes: [EntryType.TEXT],
  },
};

export const VideoOnly: Story = {
  args: {
    initialTypes: [EntryType.VIDEO],
  },
};
