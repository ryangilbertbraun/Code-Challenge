import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SectionList,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
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
import WelcomeHeader from "@/components/journal/WelcomeHeader";
import ActivityCalendar from "@/components/journal/ActivityCalendar";
import JournalStats from "@/components/journal/JournalStats";
import QuickActions from "@/components/journal/QuickActions";
import FilterPanel from "@/components/filters/FilterPanel";
import SearchBar from "@/components/filters/SearchBar";
import { JournalEntry } from "@/types/entry.types";

interface SectionData {
  title: string;
  data: JournalEntry[];
}

/**
 * JournalListScreen Component
 *
 * Main dashboard/welcome screen for the journal.
 * Features:
 * - Welcome message with time-based greeting
 * - Activity calendar showing entry frequency (GitHub-style)
 * - Quick stats about journaling activity
 * - Quick actions for creating entries and viewing all
 * - Recent entries preview
 * - Pull-to-refresh
 *
 * Requirements: 5.1, 5.2, 5.7, 8.5
 */
const JournalListScreen: React.FC = () => {
  const router = useRouter();
  const { entries, isLoading, error, fetchEntries } = useEntryStore();
  const { filters, setSearchText } = useFilterStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

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

  // Handle viewing all entries
  const handleViewAll = useCallback(() => {
    setShowAllEntries(true);
  }, []);

  // Handle going back to dashboard
  const handleBackToDashboard = useCallback(() => {
    setShowAllEntries(false);
  }, []);

  // Handle day press in calendar
  const handleDayPress = useCallback(
    (date: Date, dayEntries: JournalEntry[]) => {
      if (dayEntries.length === 1) {
        router.push({
          pathname: "/entry-detail",
          params: { id: dayEntries[0].id },
        });
      } else if (dayEntries.length > 1) {
        // Could show a modal or navigate to filtered view
        setShowAllEntries(true);
      }
    },
    [router]
  );

  // Handle filter button press
  const handleFilterPress = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  // Handle filter modal close
  const handleFilterClose = useCallback(() => {
    setShowFilterModal(false);
  }, []);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchText.trim() !== "" ||
      filters.happiness.min !== 0 ||
      filters.happiness.max !== 1 ||
      filters.fear.min !== 0 ||
      filters.fear.max !== 1 ||
      filters.sadness.min !== 0 ||
      filters.sadness.max !== 1 ||
      filters.anger.min !== 0 ||
      filters.anger.max !== 1 ||
      filters.entryTypes.length < 2
    );
  }, [filters]);

  // Get recent entries for preview (top 3)
  const recentEntries = useMemo(() => {
    return [...entries]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
  }, [entries]);

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
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Journal</Text>
          <TouchableOpacity
            onPress={handleFilterPress}
            style={styles.filterButton}
          >
            <Ionicons
              name="filter"
              size={24}
              color={
                hasActiveFilters ? colors.primary[500] : colors.textPrimary
              }
            />
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>

        <View style={styles.searchBarContainer}>
          <SearchBar
            value={filters.searchText}
            onSearchChange={setSearchText}
          />
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

        <Modal
          visible={showFilterModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleFilterClose}
        >
          <SafeAreaView style={styles.modalContainer} edges={["top"]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleFilterClose}>
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
            <FilterPanel />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  // Show full list view when requested
  if (showAllEntries) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={handleBackToDashboard}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>All Entries</Text>
          </View>
          <TouchableOpacity
            onPress={handleFilterPress}
            style={styles.filterButton}
          >
            <Ionicons
              name="filter"
              size={24}
              color={
                hasActiveFilters ? colors.primary[500] : colors.textPrimary
              }
            />
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>

        <View style={styles.searchBarContainer}>
          <SearchBar
            value={filters.searchText}
            onSearchChange={setSearchText}
          />
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
          windowSize={10}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateEntry}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color={colors.textPrimary} />
        </TouchableOpacity>

        <Modal
          visible={showFilterModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleFilterClose}
        >
          <SafeAreaView style={styles.modalContainer} edges={["top"]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleFilterClose}>
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
            <FilterPanel />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  // Main dashboard view
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.dashboardContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        <WelcomeHeader totalEntries={entries.length} />

        <QuickActions
          onCreateEntry={handleCreateEntry}
          onViewAll={handleViewAll}
        />

        <ActivityCalendar entries={entries} onDayPress={handleDayPress} />

        <JournalStats entries={entries} />

        {/* Recent Entries Preview */}
        {recentEntries.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent Entries</Text>
              <TouchableOpacity onPress={handleViewAll}>
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>
            {recentEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onPress={() => handleEntryPress(entry)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleFilterClose}
      >
        <SafeAreaView style={styles.modalContainer} edges={["top"]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleFilterClose}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
          <FilterPanel />
        </SafeAreaView>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: spacing[3],
  },
  headerTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  filterButton: {
    padding: spacing[2],
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: spacing[2],
    right: spacing[2],
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  searchBarContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  dashboardContent: {
    padding: spacing[4],
    gap: spacing[5],
  },
  listContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  recentSection: {
    gap: spacing[3],
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  viewAllLink: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  modalHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    alignItems: "flex-end",
  },
  modalCloseText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
});

export default JournalListScreen;
