import React from "react";
import { Text, StyleSheet, View } from "react-native";

/**
 * AuthLegalFooter Component
 *
 * Displays legal text with links to Privacy Policy and Terms of Service.
 * Matches the reference mobile app's AuthLegalFooter component exactly.
 */
const AuthLegalFooter = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        By continuing, you are agreeing to our{" "}
        <Text style={styles.link}>Privacy Policy</Text> {"\n"}
        and <Text style={styles.link}>Terms of Service</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  text: {
    fontSize: 12,
    color: "#444",
    textAlign: "center",
    lineHeight: 20,
  },
  link: {
    fontWeight: "600",
    color: "#1A1A1A",
  },
});

export default AuthLegalFooter;
