import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, spacing } from "@/constants/theme";
import { JournalEntry } from "@/types/entry.types";

interface ActivityCalendarProps {
  entries: JournalEntry[];
  onDayPress?: (date: Date, entries: JournalEntry[]) => void;
}

interface DayData {
  date: Date;
  count: number;
  entries: JournalEntry[];
}

/**
 * ActivityCalendar Component
 *
 * Displays a GitHub-style activity calendar showing journal entry frequency.
 * Shows the current month with color-coded squares indicating entry activity.
 */
const ActivityCalendar: React.FC<ActivityCalendarProps> = ({
  entries,
  onDayPress,
}) => {
  const { monthData, monthName, year } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthName = now.toLocaleDateString("en-US", { month: "long" });

    // Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get starting day of week (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();

    // Create entry map by date
    const entryMap = new Map<string, JournalEntry[]>();
    entries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!entryMap.has(dateKey)) {
        entryMap.set(dateKey, []);
      }
      entryMap.get(dateKey)!.push(entry);
    });

    // Build calendar data
    const weeks: (DayData | null)[][] = [];
    let currentWeek: (DayData | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = `${year}-${month}-${day}`;
      const dayEntries = entryMap.get(dateKey) || [];

      currentWeek.push({
        date,
        count: dayEntries.length,
        entries: dayEntries,
      });

      // Start new week on Sunday
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Add remaining week if not complete
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return { monthData: weeks, monthName, year };
  }, [entries]);

  const getDayColor = (count: number): string => {
    if (count === 0) return colors.neutral[100];
    if (count === 1) return colors.primary[200];
    if (count === 2) return colors.primary[400];
    return colors.primary[600];
  };

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {monthName} {year}
        </Text>
        <Text style={styles.subtitle}>Your journaling activity</Text>
      </View>

      <View style={styles.calendar}>
        {/* Week day labels */}
        <View style={styles.weekDayRow}>
          {weekDays.map((day, index) => (
            <Text key={index} style={styles.weekDayLabel}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        {monthData.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              if (!day) {
                return <View key={dayIndex} style={styles.emptyDay} />;
              }

              const isToday =
                day.date.toDateString() === new Date().toDateString();

              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.day,
                    { backgroundColor: getDayColor(day.count) },
                    isToday && styles.today,
                  ]}
                  onPress={() => onDayPress?.(day.date, day.entries)}
                  activeOpacity={0.7}
                  disabled={day.count === 0}
                >
                  <Text
                    style={[
                      styles.dayText,
                      day.count > 0 && styles.dayTextActive,
                    ]}
                  >
                    {day.date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Less</Text>
        <View
          style={[
            styles.legendSquare,
            { backgroundColor: colors.neutral[100] },
          ]}
        />
        <View
          style={[
            styles.legendSquare,
            { backgroundColor: colors.primary[200] },
          ]}
        />
        <View
          style={[
            styles.legendSquare,
            { backgroundColor: colors.primary[400] },
          ]}
        />
        <View
          style={[
            styles.legendSquare,
            { backgroundColor: colors.primary[600] },
          ]}
        />
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing[4],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  calendar: {
    marginBottom: spacing[3],
  },
  weekDayRow: {
    flexDirection: "row",
    marginBottom: spacing[2],
  },
  weekDayLabel: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textAlign: "center",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: spacing[1],
  },
  day: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  emptyDay: {
    flex: 1,
    aspectRatio: 1,
  },
  today: {
    borderWidth: 2,
    borderColor: colors.primary[700],
  },
  dayText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.medium,
  },
  dayTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: spacing[2],
  },
  legendLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginHorizontal: spacing[2],
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginHorizontal: 2,
  },
});

export default ActivityCalendar;
