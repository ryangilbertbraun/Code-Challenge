import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAlert } from "@/contexts/AlertContext";
import { colors, typography, spacing } from "@/constants/theme";

/**
 * Example component showing different alert dialog variations
 * Use this to test and preview the alert dialogs
 */
export default function AlertDialogExample() {
  const alert = useAlert();

  const showSimpleAlert = () => {
    alert.show({
      title: "Success",
      message: "Your journal entry has been created!",
    });
  };

  const showConfirmAlert = () => {
    alert.show({
      title: "Delete Entry",
      message:
        "Are you sure you want to delete this entry? This action cannot be undone.",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => console.log("Deleted!"),
        },
      ],
    });
  };

  const showLogoutAlert = () => {
    alert.show({
      title: "Log Out",
      message: "Are you sure you want to log out?",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => console.log("Logged out!"),
        },
      ],
    });
  };

  const showThreeButtonAlert = () => {
    alert.show({
      title: "Save Changes",
      message: "Do you want to save your changes before leaving?",
      buttons: [
        { text: "Don't Save", style: "destructive" },
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          style: "default",
          onPress: () => console.log("Saved!"),
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alert Dialog Examples</Text>

      <TouchableOpacity style={styles.button} onPress={showSimpleAlert}>
        <Text style={styles.buttonText}>Simple Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={showConfirmAlert}>
        <Text style={styles.buttonText}>Confirm Delete</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={showLogoutAlert}>
        <Text style={styles.buttonText}>Logout Confirmation</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={showThreeButtonAlert}>
        <Text style={styles.buttonText}>Three Button Alert</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing[6],
    backgroundColor: colors.background,
    justifyContent: "center",
    gap: spacing[4],
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[4],
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary[400],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
});
