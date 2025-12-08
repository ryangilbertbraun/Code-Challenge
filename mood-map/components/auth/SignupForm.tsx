import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AppButton from "@/components/ui/AppButton";
import AuthLegalFooter from "@/components/auth/AuthLegalFooter";

interface SignupFormProps {
  opacity: Animated.Value;
  height: Animated.Value;
  onApplePress?: () => void;
  onGooglePress?: () => void;
  onEmailPress: (
    email: string,
    password: string,
    confirmPassword: string
  ) => void;
  animateTransitionBack: () => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * SignupForm Component
 *
 * Provides email/password signup with validation.
 * Matches the reference mobile app's signup flow with additional input fields.
 */
const SignupForm: React.FC<SignupFormProps> = ({
  opacity,
  height,
  onApplePress,
  onGooglePress,
  onEmailPress,
  animateTransitionBack,
  loading = false,
  error,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible((prev) => !prev);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: height,
          opacity: opacity,
        },
      ]}
    >
      <Text style={styles.formHeader}>Create Your Account</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#999"
        autoCapitalize="none"
        keyboardType="email-address"
        testID="email-input"
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
          style={styles.input}
          placeholderTextColor="#999"
          testID="password-input"
        />
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {isPasswordVisible ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!isConfirmPasswordVisible}
          style={styles.input}
          placeholderTextColor="#999"
          testID="confirm-password-input"
        />
        <TouchableOpacity
          onPress={toggleConfirmPasswordVisibility}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {isConfirmPasswordVisible ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      <AppButton
        label="sign up"
        onPress={() => onEmailPress(email, password, confirmPassword)}
        loading={loading}
      />

      <AuthLegalFooter />
      <View style={styles.backButtonContainer}>
        <AppButton
          label="Back"
          variant="secondary"
          onPress={() => {
            animateTransitionBack();
          }}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  backButtonContainer: {
    marginTop: 8,
    marginBottom: 16,
    width: "100%",
  },
  input: {
    backgroundColor: "#F1F1F1",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    color: "#1A1A1A",
    height: 56,
    width: "100%",
  },
  inputContainer: {
    position: "relative",
    width: "100%",
    justifyContent: "center",
  },
  toggleButton: {
    position: "absolute",
    right: 10,
    top: 0,
    justifyContent: "center",
    paddingHorizontal: 10,
    height: 56,
  },
  toggleText: {
    color: "#007AFF",
    fontWeight: "500",
    textAlign: "center",
  },
  formHeader: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#1A1A1A",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: "100%",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
});

export default SignupForm;
