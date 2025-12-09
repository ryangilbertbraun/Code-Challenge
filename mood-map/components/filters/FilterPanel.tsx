import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing } from "@/constants/theme";
import { animations } from "@/constants/animations";
import { useFilterStore } from "@/stores/filterStore";
import { SortOption } from "@/types/filter.types";
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
  const { filters, setEmotionRange, setEntryTypes, setSortBy, resetFilters } =
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
        <View style={styles.sortSection}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <View style={styles.sortOptions}>
            <TouchableOpacity
              style={[
                styles.sortOptionButton,
                filters.sortBy === SortOption.NEWEST_FIRST &&
                  styles.sortOptionButtonActive,
              ]}
              onPress={() => setSortBy(SortOption.NEWEST_FIRST)}
              activeOpacity={animations.feedback.pressOpacity}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={
                  filters.sortBy === SortOption.NEWEST_FIRST
                    ? colors.background
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.sortOptionButtonText,
                  filters.sortBy === SortOption.NEWEST_FIRST &&
                    styles.sortOptionButtonTextActive,
                ]}
              >
                Newest
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortOptionButton,
                filters.sortBy === SortOption.OLDEST_FIRST &&
                  styles.sortOptionButtonActive,
              ]}
              onPress={() => setSortBy(SortOption.OLDEST_FIRST)}
              activeOpacity={animations.feedback.pressOpacity}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={
                  filters.sortBy === SortOption.OLDEST_FIRST
                    ? colors.background
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.sortOptionButtonText,
                  filters.sortBy === SortOption.OLDEST_FIRST &&
                    styles.sortOptionButtonTextActive,
                ]}
              >
                Oldest
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortOptionButton,
                filters.sortBy === SortOption.HAPPIEST_FIRST &&
                  styles.sortOptionButtonActive,
              ]}
              onPress={() => setSortBy(SortOption.HAPPIEST_FIRST)}
              activeOpacity={animations.feedback.pressOpacity}
            >
              <Ionicons
                name="happy-outline"
                size={18}
                color={
                  filters.sortBy === SortOption.HAPPIEST_FIRST
                    ? colors.background
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.sortOptionButtonText,
                  filters.sortBy === SortOption.HAPPIEST_FIRST &&
                    styles.sortOptionButtonTextActive,
                ]}
              >
                Happiest
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortOptionButton,
                filters.sortBy === SortOption.SADDEST_FIRST &&
                  styles.sortOptionButtonActive,
              ]}
              onPress={() => setSortBy(SortOption.SADDEST_FIRST)}
              activeOpacity={animations.feedback.pressOpacity}
            >
              <Ionicons
                name="sad-outline"
                size={18}
                color={
                  filters.sortBy === SortOption.SADDEST_FIRST
                    ? colors.background
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.sortOptionButtonText,
                  filters.sortBy === SortOption.SADDEST_FIRST &&
                    styles.sortOptionButtonTextActive,
                ]}
              >
                Saddest
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
  sortSection: {
    marginBottom: spacing[4],
  },
  sortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  sortOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    gap: spacing[2],
  },
  sortOptionButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  sortOptionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  sortOptionButtonTextActive: {
    color: colors.background,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default FilterPanel;
