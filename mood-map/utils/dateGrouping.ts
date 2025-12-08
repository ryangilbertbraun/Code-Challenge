// Date grouping utility for journal entries
// Groups entries into: today, yesterday, this week, earlier

import { JournalEntry } from "../types/entry.types";

export enum DateGroup {
  TODAY = "today",
  YESTERDAY = "yesterday",
  THIS_WEEK = "this_week",
  EARLIER = "earlier",
}

export interface GroupedEntries {
  [DateGroup.TODAY]: JournalEntry[];
  [DateGroup.YESTERDAY]: JournalEntry[];
  [DateGroup.THIS_WEEK]: JournalEntry[];
  [DateGroup.EARLIER]: JournalEntry[];
}

/**
 * Group journal entries by date categories
 * @param entries - Array of journal entries to group
 * @returns Grouped entries object with entries organized by date category
 */
export function groupByDate(entries: JournalEntry[]): GroupedEntries {
  const grouped: GroupedEntries = {
    [DateGroup.TODAY]: [],
    [DateGroup.YESTERDAY]: [],
    [DateGroup.THIS_WEEK]: [],
    [DateGroup.EARLIER]: [],
  };

  // Get current date boundaries in local timezone
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const yesterdayStart = getStartOfDay(addDays(now, -1));
  const thisWeekStart = getStartOfWeek(now);

  entries.forEach((entry) => {
    const entryDate = new Date(entry.createdAt);
    const entryDayStart = getStartOfDay(entryDate);

    // Determine which group the entry belongs to
    if (entryDayStart.getTime() >= todayStart.getTime()) {
      grouped[DateGroup.TODAY].push(entry);
    } else if (entryDayStart.getTime() >= yesterdayStart.getTime()) {
      grouped[DateGroup.YESTERDAY].push(entry);
    } else if (entryDayStart.getTime() >= thisWeekStart.getTime()) {
      grouped[DateGroup.THIS_WEEK].push(entry);
    } else {
      grouped[DateGroup.EARLIER].push(entry);
    }
  });

  return grouped;
}

/**
 * Get the start of day (midnight) for a given date in local timezone
 * Handles midnight boundary correctly
 */
function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the start of the week (Monday at midnight) for a given date in local timezone
 * Week starts on Monday (ISO 8601 standard)
 */
function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();

  // Calculate days to subtract to get to Monday
  // Sunday is 0, Monday is 1, etc.
  const daysToMonday = day === 0 ? 6 : day - 1;

  result.setDate(result.getDate() - daysToMonday);
  result.setHours(0, 0, 0, 0);

  return result;
}

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get a human-readable label for a date group
 */
export function getDateGroupLabel(group: DateGroup): string {
  switch (group) {
    case DateGroup.TODAY:
      return "Today";
    case DateGroup.YESTERDAY:
      return "Yesterday";
    case DateGroup.THIS_WEEK:
      return "This Week";
    case DateGroup.EARLIER:
      return "Earlier";
    default:
      return "";
  }
}

/**
 * Get all date groups in display order
 */
export function getDateGroupsInOrder(): DateGroup[] {
  return [
    DateGroup.TODAY,
    DateGroup.YESTERDAY,
    DateGroup.THIS_WEEK,
    DateGroup.EARLIER,
  ];
}
