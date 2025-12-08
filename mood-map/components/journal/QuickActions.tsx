import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing } from "@/constants/theme";

interface QuickActionsProps {
  onCreateEntry: () => void;
  onViewAll: () => void;
}

/**
 * QuickActions Component
 *
 * Displays quick action buttons for common tasks.
 */
const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateEntry,
  onViewAll,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.actionButton, styles.primaryButton]}
        onPress={onCreateEntry}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={24} color={colors.textPrimary} />
        <Text style={styles.primaryButtonText}>New Entry</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.secondaryButton]}
        onPress={onViewAll}
        activeOpacity={0.8}
      >
        <Ionicons name="list" size={24} color={colors.primary[600]} />
        <Text style={styles.secondaryButtonText}>View All</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderRadius: 12,
    gap: spacing[2],
  },
  primaryButton: {
    backgroundColor: colors.primary[400],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary[400],
  },
  primaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
});

export default QuickActions;
