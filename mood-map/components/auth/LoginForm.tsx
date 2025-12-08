import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import AppButton from "@/components/ui/AppButton";
import AuthLegalFooter from "@/components/auth/AuthLegalFooter";

interface LoginFormProps {
  opacity: Animated.Value;
  height: Animated.Value;
  onLogin: (email: string, password: string) => void;
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  animateTransitionBack: () => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * LoginForm Component
 *
 * Provides email and password input fields for user login.
 * Matches the reference mobile app's LoginOptions component exactly.
 */
const LoginForm: React.FC<LoginFormProps> = ({
  opacity,
  height,
  onLogin,
  onGoogleLogin,
  onAppleLogin,
  animateTransitionBack,
  loading = false,
  error,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <Animated.View style={[{ height: height, opacity: opacity }]}>
      <Text style={styles.formHeader}>Welcome Back</Text>

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

      <AppButton
        label="login"
        onPress={() => onLogin(email, password)}
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
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
});

export default LoginForm;
