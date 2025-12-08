import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { colors, spacing, typography } from "../constants/theme";

// Import all stories
import * as MoodBadgeStories from "../components/journal/MoodBadge.stories";
import * as EmotionVisualizationStories from "../components/journal/EmotionVisualization.stories";
import * as EntryCardStories from "../components/journal/EntryCard.stories";
import * as TextEntryDetailStories from "../components/journal/TextEntryDetail.stories";
import * as VideoEntryDetailStories from "../components/journal/VideoEntryDetail.stories";
import * as EmotionSliderStories from "../components/filters/EmotionSlider.stories";
import * as SearchBarStories from "../components/filters/SearchBar.stories";
import * as TypeFilterStories from "../components/filters/TypeFilter.stories";
import * as FilterPanelStories from "../components/filters/FilterPanel.stories";
import * as VideoRecorderStories from "../components/video/VideoRecorder.stories";
import * as VideoPlayerStories from "../components/video/VideoPlayer.stories";

const allStories = {
  MoodBadge: MoodBadgeStories,
  EmotionVisualization: EmotionVisualizationStories,
  EntryCard: EntryCardStories,
  TextEntryDetail: TextEntryDetailStories,
  VideoEntryDetail: VideoEntryDetailStories,
  EmotionSlider: EmotionSliderStories,
  SearchBar: SearchBarStories,
  TypeFilter: TypeFilterStories,
  FilterPanel: FilterPanelStories,
  VideoRecorder: VideoRecorderStories,
  VideoPlayer: VideoPlayerStories,
};

/**
 * Simple Storybook UI for viewing components
 * This is a minimal implementation that works without the full Storybook setup
 */
export default function StorybookUIRoot() {
  const [selectedComponent, setSelectedComponent] = React.useState<
    string | null
  >(null);
  const [selectedStory, setSelectedStory] = React.useState<string | null>(null);

  if (selectedComponent && selectedStory) {
    const stories = allStories[selectedComponent as keyof typeof allStories];
    const storyObj = (stories as any)[selectedStory];
    const meta = (stories as any).default;

    // Get the component from the meta
    const Component = meta?.component;

    // Get args from the story or use default args
    const args = storyObj?.args || meta?.args || {};

    // Check if story has a custom render function
    const renderFunction = storyObj?.render;

    // Check if this is a full-screen component (like VideoRecorder)
    const isFullScreen = selectedComponent === "VideoRecorder";

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setSelectedStory(null);
              setSelectedComponent(null);
            }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {selectedComponent} / {selectedStory}
          </Text>
        </View>
        {isFullScreen ? (
          <View style={styles.fullScreenContainer}>
            {renderFunction ? (
              renderFunction(args)
            ) : Component ? (
              <Component {...args} />
            ) : (
              <Text style={styles.errorText}>Story not found</Text>
            )}
          </View>
        ) : (
          <ScrollView style={styles.storyContainer}>
            {renderFunction ? (
              renderFunction(args)
            ) : Component ? (
              <Component {...args} />
            ) : (
              <Text style={styles.errorText}>Story not found</Text>
            )}
          </ScrollView>
        )}
      </View>
    );
  }

  if (selectedComponent) {
    const stories = allStories[selectedComponent as keyof typeof allStories];
    const storyNames = Object.keys(stories).filter((key) => key !== "default");

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setSelectedComponent(null)}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{selectedComponent} Stories</Text>
        </View>
        <ScrollView style={styles.list}>
          {storyNames.map((storyName) => (
            <TouchableOpacity
              key={storyName}
              style={styles.listItem}
              onPress={() => setSelectedStory(storyName)}
            >
              <Text style={styles.listItemText}>{storyName}</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Component Storybook</Text>
        <Text style={styles.subtitle}>
          Select a component to view its stories
        </Text>
      </View>
      <ScrollView style={styles.list}>
        {Object.keys(allStories).map((componentName) => (
          <TouchableOpacity
            key={componentName}
            style={styles.listItem}
            onPress={() => setSelectedComponent(componentName)}
          >
            <Text style={styles.listItemText}>{componentName}</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing[4],
    paddingTop: spacing[12],
    backgroundColor: colors.primary[400],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    marginBottom: spacing[2],
  },
  backText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.background,
  },
  listItemText: {
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  arrow: {
    fontSize: typography.fontSize.xl,
    color: colors.primary[400],
  },
  storyContainer: {
    flex: 1,
    padding: spacing[4],
  },
  fullScreenContainer: {
    flex: 1,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    textAlign: "center",
    marginTop: spacing[8],
  },
});
