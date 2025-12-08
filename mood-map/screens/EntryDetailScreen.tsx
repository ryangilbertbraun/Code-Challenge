import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing } from "@/constants/theme";
import { useEntryStore } from "@/stores/entryStore";
import { EntryType } from "@/types/entry.types";
import TextEntryDetail from "@/components/journal/TextEntryDetail";
import VideoEntryDetail from "@/components/journal/VideoEntryDetail";

/**
 * EntryDetailScreen Component
 *
 * Displays full entry details based on entry type.
 * Features:
 * - Shows TextEntryDetail for text entries
 * - Shows VideoEntryDetail for video entries
 * - Provides delete functionality with confirmation
 * - Handles navigation back to list
 *
 * Requirements: 5.5, 5.6
 */
const EntryDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const entryId = params.id as string;

  const { entries, deleteEntry } = useEntryStore();
  const [isDeleting, setIsDeleting] = useState(false);

  // Find the entry by ID
  const entry = entries.find((e) => e.id === entryId);

  // Handle delete with confirmation
  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteEntry(entryId);
              // Navigate back to list after successful deletion
              router.back();
            } catch (error) {
              setIsDeleting(false);
              Alert.alert("Error", "Failed to delete entry. Please try again.");
            }
          },
        },
      ]
    );
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Loading state while deleting
  if (isDeleting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Deleting entry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Entry not found
  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Entry Not Found</Text>
          <Text style={styles.errorMessage}>
            This entry may have been deleted or does not exist.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back and delete buttons */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Entry content based on type */}
      {entry.type === EntryType.TEXT ? (
        <TextEntryDetail entry={entry} />
      ) : (
        <VideoEntryDetail entry={entry} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.background,
  },
  backButton: {
    padding: spacing[2],
  },
  deleteButton: {
    padding: spacing[2],
  },
  loadingContainer: {
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[6],
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
});

export default EntryDetailScreen;
