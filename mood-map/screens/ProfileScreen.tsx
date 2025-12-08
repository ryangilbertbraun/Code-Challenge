import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, typography, spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/authStore";
import { useEntryStore } from "@/stores/entryStore";

/**
 * Profile Screen
 * Displays user profile information, statistics, and account settings
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { session, logout } = useAuthStore();
  const { entries } = useEntryStore();

  // Calculate user statistics
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, entry) => {
      if (entry.type === "text") {
        return sum + (entry.content?.split(/\s+/).length || 0);
      }
      return sum;
    }, 0);

    // Calculate streak (consecutive days with entries)
    const sortedDates = entries
      .map((e) => new Date(e.createdAt).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (sortedDates.length > 0) {
      if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        currentStreak = 1;
        let checkDate = new Date(sortedDates[0]);

        for (let i = 1; i < sortedDates.length; i++) {
          checkDate = new Date(checkDate.getTime() - 86400000);
          if (sortedDates[i] === checkDate.toDateString()) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Calculate days since first entry
    const daysSinceStart =
      entries.length > 0
        ? Math.floor(
            (Date.now() -
              new Date(
                Math.min(...entries.map((e) => new Date(e.createdAt).getTime()))
              ).getTime()) /
              86400000
          )
        : 0;

    return {
      totalEntries,
      totalWords,
      currentStreak,
      daysSinceStart,
    };
  }, [entries]);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/auth");
            } catch (error) {
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {session?.user.email?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>
            {session?.user.email?.split("@")[0] || "User"}
          </Text>
          <Text style={styles.userEmail}>{session?.user.email}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.contentSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📝</Text>
              <Text style={styles.statValue}>{stats.totalEntries}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>✍️</Text>
              <Text style={styles.statValue}>
                {stats.totalWords.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statValue}>{stats.daysSinceStart}</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account</Text>
            <View style={styles.menuList}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                disabled
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="person-outline"
                    size={24}
                    color={colors.textTertiary}
                  />
                  <Text style={styles.menuItemTextDisabled}>Edit Profile</Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                disabled
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={24}
                    color={colors.textTertiary}
                  />
                  <Text style={styles.menuItemTextDisabled}>
                    Change Password
                  </Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Preferences</Text>
            <View style={styles.menuList}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                disabled
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color={colors.textTertiary}
                  />
                  <Text style={styles.menuItemTextDisabled}>Notifications</Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                disabled
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="color-palette-outline"
                    size={24}
                    color={colors.textTertiary}
                  />
                  <Text style={styles.menuItemTextDisabled}>Theme</Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                disabled
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={24}
                    color={colors.textTertiary}
                  />
                  <Text style={styles.menuItemTextDisabled}>Privacy</Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Support</Text>
            <View style={styles.menuList}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                disabled
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="help-circle-outline"
                    size={24}
                    color={colors.textTertiary}
                  />
                  <Text style={styles.menuItemTextDisabled}>Help Center</Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                disabled
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="mail-outline"
                    size={24}
                    color={colors.textTertiary}
                  />
                  <Text style={styles.menuItemTextDisabled}>Contact Us</Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                disabled
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color={colors.textTertiary}
                  />
                  <Text style={styles.menuItemTextDisabled}>
                    Terms & Privacy
                  </Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.versionText}>MoodMap v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: spacing[8],
  },
  heroSection: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
    alignItems: "center",
    gap: spacing[2],
  },
  avatarContainer: {
    marginBottom: spacing[2],
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary[400],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  userName: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  contentSection: {
    padding: spacing[4],
    gap: spacing[4],
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing[4],
    alignItems: "center",
    gap: spacing[2],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    fontSize: 32,
  },
  statValue: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing[5],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },
  menuList: {
    gap: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing[3],
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    flex: 1,
  },
  menuItemText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginLeft: spacing[10],
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: spacing[4],
    borderWidth: 1,
    borderColor: colors.error,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  versionText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: spacing[2],
  },
});
