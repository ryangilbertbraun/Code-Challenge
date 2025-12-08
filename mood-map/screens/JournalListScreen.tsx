import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const router = useRouter();
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

  // Entry press handler - navigate to entry detail screen
  const handleEntryPress = useCallback(
    (entry: JournalEntry) => {
      router.push({
        pathname: "/entry-detail",
        params: { id: entry.id },
      });
    },
    [router]
  );

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

  // Navigate to create entry screen
  const handleCreateEntry = useCallback(() => {
    router.push("/create-entry");
  }, [router]);

  // Loading state (initial load)
  if (isLoading && entries.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Journal</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading your journal...</Text>
        </View>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateEntry}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color={colors.textPrimary} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && entries.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Journal</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Unable to load entries</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateEntry}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color={colors.textPrimary} />
        </TouchableOpacity>
      </SafeAreaView>
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
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Journal</Text>
        </View>
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
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateEntry}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color={colors.textPrimary} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Main list view
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Journal</Text>
      </View>

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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateEntry}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={colors.textPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
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
  fab: {
    position: "absolute",
    bottom: spacing[6],
    right: spacing[6],
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[400],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default JournalListScreen;
