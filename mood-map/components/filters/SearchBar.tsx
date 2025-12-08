import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onSearchChange: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

/**
 * SearchBar Component
 *
 * Provides a text input for searching journal entries with debounced input.
 * Default debounce delay is 300ms to avoid excessive filtering operations.
 */
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onSearchChange,
  placeholder = "Search entries...",
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onSearchChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onSearchChange, value]);

  // Sync with external value changes
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    onSearchChange("");
  }, [onSearchChange]);

  return (
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={20}
        color={colors.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        value={localValue}
        onChangeText={setLocalValue}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {localValue.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    paddingVertical: spacing[1],
  },
  clearButton: {
    padding: spacing[1],
    marginLeft: spacing[2],
  },
});

export default SearchBar;
