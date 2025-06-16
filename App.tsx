import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./app/navigation/AppNavigator";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { ActivityIndicator, View } from "react-native";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
import Toast from "react-native-toast-message";
import { AuthProvider } from "./app/context/AuthContext";
import { useFilesRealtime } from "./app/hooks/useFilesRealtime";

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  useFilesRealtime({
    onInsert: (payload) => console.log("File inserted:", payload),
    onUpdate: (payload) => console.log("File updated:", payload),
    onDelete: (payload) => console.log("File deleted:", payload),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </AuthProvider>
  );
}
