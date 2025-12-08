import type { Preview } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";
import { colors } from "../constants/theme";

export const decorators = [
  (Story: any) => (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Story />
    </View>
  ),
];

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const preview: Preview = {
  decorators,
  parameters,
};

export default preview;
