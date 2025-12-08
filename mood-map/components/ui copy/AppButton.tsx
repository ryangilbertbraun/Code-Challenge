import React from "react";
import { StyleSheet, View, Text, ViewStyle } from "react-native";
import { TouchableRipple } from "react-native-paper";
import { AntDesign, FontAwesome } from "@expo/vector-icons";

type AppButtonIconName = "google" | "apple" | "facebook" | "mail";
type IconProvider = "antdesign" | "fontawesome";
type AppButtonVariant = "solid" | "text";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  loading?: boolean;
  disabled?: boolean;
  iconName?: AppButtonIconName;
  iconProvider?: IconProvider;
  uppercase?: boolean;
  variant?: AppButtonVariant;
  testID?: string;
}

/**
 * AppButton Component
 *
 * A reusable button component with press feedback animations.
 * Matches the reference mobile app's button styling exactly.
 */
const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  style,
  loading = false,
  disabled = false,
  iconName,
  iconProvider = "antdesign",
  uppercase = true,
  variant = "solid",
  testID,
}) => {
  const getIcon = () => {
    if (!iconName) return null;

    const size = 24;
    const color = variant === "text" ? "#114DA9" : "#fff";

    let normalizedName: string = iconName;

    if (iconProvider === "antdesign" && iconName === "apple") {
      normalizedName = "apple1";
    }

    switch (iconProvider) {
      case "fontawesome":
        return (
          <FontAwesome name={normalizedName as any} size={size} color={color} />
        );
      case "antdesign":
      default:
        return (
          <AntDesign name={normalizedName as any} size={size} color={color} />
        );
    }
  };

  const labelText = uppercase ? label.toUpperCase() : label;
  const textColor = variant === "text" ? "#114DA9" : "#fff";

  return (
    <TouchableRipple
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        variant === "text" && styles.textButton,
        style,
        disabled && styles.disabled,
      ]}
      rippleColor="rgba(0,0,0,0.1)"
      testID={testID}
    >
      <View style={styles.content}>
        {iconName && <View style={styles.icon}>{getIcon()}</View>}
        <Text style={[styles.label, { color: textColor }]}>{labelText}</Text>
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#114DA9",
    borderRadius: 32,
    height: 56,
    marginVertical: 8,
    justifyContent: "center",
    width: "100%",
    maxWidth: 700,
  },
  textButton: {
    backgroundColor: "transparent",
    height: 40,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    height: "100%",
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.02,
  },
});

export default AppButton;
