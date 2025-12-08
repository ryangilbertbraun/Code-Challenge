import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SectionList,
} from "react-native";
import { colors, typography, spacing } from "@/constants/theme";
import { useEntryStore } from "@/stores/entryStore";
import { useFilterStore } from "@/stores/filterStore";
import { applyFilterPipeline } from "@/utils/filterPipeline";
import {
  groupByDate,
  getDateGroupLabel,
  getDateGroupsInOrder,
} from "@/utils/dateGrouping";
import EntryCard from "@/components/journal/EntryCard";
import { JournalEntry } from "@/types/entry.types";

interface SectionData {
  title: string;
  data: JournalEntry[];
}

/**
 * JournalListScreen Component
 *
 * Main screen for displaying journal entries with filtering and grouping.
 * Features:
 * - Fetches entries from entryStore
 * - Applies filters from filterStore
 * - Groups entries by date (today, yesterday, this week, earlier)
 * - Displays in descending chronological order
 * - Shows loading states
 * - Shows empty state when no entries match filters
 * - Implements pull-to-refresh
 * - Uses SectionList for performance with date grouping
 *
 * Requirements: 5.1, 5.2, 5.7, 8.5
 */
const JournalListScreen: React.FC = () => {
  const { entries, isLoading, error, fetchEntries } = useEntryStore();
  const { filters } = useFilterStore();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch entries on mount
  useEffect(() => {
    // Add a small delay to ensure auth session is initialized
    const timer = setTimeout(() => {
      fetchEntries().catch((err) => {
        console.error("Failed to fetch entries:", err);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [fetchEntries]);

  // Apply filtering pipeline and date grouping
  // Memoized to avoid recalculation on every render
  const sections = useMemo(() => {
    // Step 1: Apply filter pipeline (emotion → search → type → sort)
    const filteredEntries = applyFilterPipeline(entries, filters);

    // Step 2: Group by date
    const grouped = groupByDate(filteredEntries);

    // Step 3: Convert to section list format
    const sectionData: SectionData[] = getDateGroupsInOrder()
      .map((group) => ({
        title: getDateGroupLabel(group),
        data: grouped[group],
      }))
      .filter((section) => section.data.length > 0); // Only show sections with entries

    return sectionData;
  }, [entries, filters]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchEntries();
    } finally {
      setRefreshing(false);
    }
  }, [fetchEntries]);

  // Entry press handler (placeholder - will be wired to navigation)
  const handleEntryPress = useCallback((entry: JournalEntry) => {
    // TODO: Navigate to entry detail screen
    console.log("Entry pressed:", entry.id);
  }, []);

  // Render section header
  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionData }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    ),
    []
  );

  // Render entry item
  const renderItem = useCallback(
    ({ item }: { item: JournalEntry }) => (
      <EntryCard entry={item} onPress={() => handleEntryPress(item)} />
    ),
    [handleEntryPress]
  );

  // Key extractor
  const keyExtractor = useCallback((item: JournalEntry) => item.id, []);

  // Loading state (initial load)
  if (isLoading && entries.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading your journal...</Text>
      </View>
    );
  }

  // Error state
  if (error && entries.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Unable to load entries</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  // Empty state (no entries match filters)
  if (sections.length === 0) {
    const hasActiveFilters =
      filters.searchText.trim() !== "" ||
      filters.happiness.min !== 0 ||
      filters.happiness.max !== 1 ||
      filters.fear.min !== 0 ||
      filters.fear.max !== 1 ||
      filters.sadness.min !== 0 ||
      filters.sadness.max !== 1 ||
      filters.anger.min !== 0 ||
      filters.anger.max !== 1 ||
      filters.entryTypes.length < 2;

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>
          {hasActiveFilters ? "No matching entries" : "No entries yet"}
        </Text>
        <Text style={styles.emptyMessage}>
          {hasActiveFilters
            ? "Try adjusting your filters to see more entries"
            : "Start journaling to see your entries here"}
        </Text>
      </View>
    );
  }

  // Main list view
  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        // Performance optimizations
        windowSize={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  listContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  sectionHeader: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    marginLeft: -spacing[4],
    marginRight: -spacing[4],
    marginBottom: spacing[2],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[6],
    backgroundColor: colors.backgroundSecondary,
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  errorTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
    marginBottom: spacing[2],
    textAlign: "center",
  },
  errorMessage: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[2],
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default JournalListScreen;
