import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, spacing } from "@/constants/theme";
import { animations } from "@/constants/animations";
import { EntryType } from "@/types/entry.types";

interface TypeFilterProps {
  selectedTypes: EntryType[];
  onTypesChange: (types: EntryType[]) => void;
}

/**
 * TypeFilter Component
 *
 * Allows users to filter journal entries by type (text, video, or both).
 * Displays toggle buttons for each entry type with visual feedback.
 */
const TypeFilter: React.FC<TypeFilterProps> = ({
  selectedTypes,
  onTypesChange,
}) => {
  const isTextSelected = selectedTypes.includes(EntryType.TEXT);
  const isVideoSelected = selectedTypes.includes(EntryType.VIDEO);

  const handleToggleText = () => {
    if (isTextSelected) {
      // Remove text, but ensure at least one type is selected
      if (isVideoSelected) {
        onTypesChange([EntryType.VIDEO]);
      }
    } else {
      // Add text
      onTypesChange([...selectedTypes, EntryType.TEXT]);
    }
  };

  const handleToggleVideo = () => {
    if (isVideoSelected) {
      // Remove video, but ensure at least one type is selected
      if (isTextSelected) {
        onTypesChange([EntryType.TEXT]);
      }
    } else {
      // Add video
      onTypesChange([...selectedTypes, EntryType.VIDEO]);
    }
  };

  const handleSelectBoth = () => {
    onTypesChange([EntryType.TEXT, EntryType.VIDEO]);
  };

  const isBothSelected = isTextSelected && isVideoSelected;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Entry Type</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            isTextSelected && styles.buttonSelected,
            styles.buttonLeft,
          ]}
          onPress={handleToggleText}
          activeOpacity={animations.feedback.pressOpacity}
        >
          <Text
            style={[
              styles.buttonText,
              isTextSelected && styles.buttonTextSelected,
            ]}
          >
            Text
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            isVideoSelected && styles.buttonSelected,
            styles.buttonMiddle,
          ]}
          onPress={handleToggleVideo}
          activeOpacity={animations.feedback.pressOpacity}
        >
          <Text
            style={[
              styles.buttonText,
              isVideoSelected && styles.buttonTextSelected,
            ]}
          >
            Video
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            isBothSelected && styles.buttonSelected,
            styles.buttonRight,
          ]}
          onPress={handleSelectBoth}
          activeOpacity={animations.feedback.pressOpacity}
        >
          <Text
            style={[
              styles.buttonText,
              isBothSelected && styles.buttonTextSelected,
            ]}
          >
            Both
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[3],
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },
  buttonContainer: {
    flexDirection: "row",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing[1],
  },
  button: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 10,
  },
  buttonLeft: {
    marginRight: spacing[1],
  },
  buttonMiddle: {
    marginHorizontal: spacing[1],
  },
  buttonRight: {
    marginLeft: spacing[1],
  },
  buttonSelected: {
    backgroundColor: colors.primary[400],
  },
  buttonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  buttonTextSelected: {
    color: colors.background,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default TypeFilter;
