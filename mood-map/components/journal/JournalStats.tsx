import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing } from "@/constants/theme";
import { JournalEntry } from "@/types/entry.types";

interface JournalStatsProps {
  entries: JournalEntry[];
}

/**
 * JournalStats Component
 *
 * Displays quick statistics about journal entries.
 */
const JournalStats: React.FC<JournalStatsProps> = ({ entries }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return (
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    });

    const thisWeek = entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return entryDate >= weekAgo;
    });

    const videoCount = entries.filter((e) => e.type === "video").length;
    const textCount = entries.filter((e) => e.type === "text").length;

    return {
      total: entries.length,
      thisMonth: thisMonth.length,
      thisWeek: thisWeek.length,
      videoCount,
      textCount,
    };
  }, [entries]);

  return (
    <View style={styles.container}>
      <View style={styles.statRow}>
        <StatCard
          icon="calendar-outline"
          label="This Week"
          value={stats.thisWeek}
          color={colors.primary[400]}
        />
        <StatCard
          icon="calendar"
          label="This Month"
          value={stats.thisMonth}
          color={colors.primary[500]}
        />
      </View>
      <View style={styles.statRow}>
        <StatCard
          icon="videocam-outline"
          label="Video Entries"
          value={stats.videoCount}
          color={colors.emotion.positive}
        />
        <StatCard
          icon="document-text-outline"
          label="Text Entries"
          value={stats.textCount}
          color={colors.emotion.happiness}
        />
      </View>
    </View>
  );
};

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  statRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing[4],
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing[2],
  },
  statValue: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default JournalStats;
