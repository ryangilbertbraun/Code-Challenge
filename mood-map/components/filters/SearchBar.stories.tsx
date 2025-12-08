import type { Meta, StoryObj } from "@storybook/react-native";
import React, { useState } from "react";
import { View, Text } from "react-native";
import SearchBar from "./SearchBar";
import { colors, typography } from "@/constants/theme";

/**
 * SearchBar provides a text input for searching journal entries
 * with debounced input (default 300ms) to avoid excessive filtering.
 */

// Wrapper component to handle state
const SearchBarWithState = (props: {
  debounceMs?: number;
  placeholder?: string;
}) => {
  const [searchText, setSearchText] = useState("");
  return (
    <View>
      <SearchBar
        value={searchText}
        onSearchChange={setSearchText}
        debounceMs={props.debounceMs}
        placeholder={props.placeholder}
      />
      <Text
        style={{
          marginTop: 12,
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        }}
      >
        Current value: &quot;{searchText}&quot;
      </Text>
    </View>
  );
};

const meta = {
  title: "Filters/SearchBar",
  component: SearchBarWithState,
  argTypes: {
    placeholder: {
      control: "text",
    },
    debounceMs: {
      control: { type: "number", min: 0, max: 2000, step: 100 },
    },
  },
  args: {
    placeholder: "Search entries...",
    debounceMs: 300,
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SearchBarWithState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Search entries...",
    debounceMs: 300,
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: "Find your thoughts...",
    debounceMs: 300,
  },
};

export const WithFastDebounce: Story = {
  args: {
    placeholder: "Search entries...",
    debounceMs: 100,
  },
};

export const WithSlowDebounce: Story = {
  args: {
    placeholder: "Search entries...",
    debounceMs: 1000,
  },
};
