import * as LocalAuthentication from "expo-local-authentication";
import { Alert } from "react-native";

export async function attemptBiometricLogin(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    Alert.alert("Biometric login not available on this device.");
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Log in with Face ID or Biometrics",
    fallbackLabel: "Use Passcode",
  });

  return result.success;
}
