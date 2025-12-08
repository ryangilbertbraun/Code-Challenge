import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors, typography, spacing } from "@/constants/theme";
import { animations } from "@/constants/animations";
import { useFilterStore } from "@/stores/filterStore";
import EmotionSlider from "./EmotionSlider";
import TypeFilter from "./TypeFilter";

/**
 * FilterPanel Component
 *
 * Main container for all filter controls. Provides a comprehensive interface
 * for filtering journal entries by emotion, type, and search text.
 * Includes a clear filters button to reset all filters to defaults.
 */
const FilterPanel: React.FC = () => {
  const { filters, setEmotionRange, setEntryTypes, resetFilters } =
    useFilterStore();

  const isFiltersActive =
    filters.happiness.min !== 0 ||
    filters.happiness.max !== 1 ||
    filters.fear.min !== 0 ||
    filters.fear.max !== 1 ||
    filters.sadness.min !== 0 ||
    filters.sadness.max !== 1 ||
    filters.anger.min !== 0 ||
    filters.anger.max !== 1 ||
    filters.entryTypes.length !== 2;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        {isFiltersActive && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={resetFilters}
            activeOpacity={animations.feedback.pressOpacity}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <TypeFilter
          selectedTypes={filters.entryTypes}
          onTypesChange={setEntryTypes}
        />

        <View style={styles.emotionSection}>
          <Text style={styles.sectionTitle}>Emotion Ranges</Text>
          <EmotionSlider
            emotion="happiness"
            range={filters.happiness}
            onRangeChange={(range) => setEmotionRange("happiness", range)}
          />
          <EmotionSlider
            emotion="sadness"
            range={filters.sadness}
            onRangeChange={(range) => setEmotionRange("sadness", range)}
          />
          <EmotionSlider
            emotion="anger"
            range={filters.anger}
            onRangeChange={(range) => setEmotionRange("anger", range)}
          />
          <EmotionSlider
            emotion="fear"
            range={filters.fear}
            onRangeChange={(range) => setEmotionRange("fear", range)}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    paddingTop: spacing[4],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  clearButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.primary[400],
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  emotionSection: {
    marginTop: spacing[2],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },
});

export default FilterPanel;
