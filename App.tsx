import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  useFonts,
} from "@expo-google-fonts/roboto";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-get-random-values";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";
import AppNavigator from "./app/navigation/AppNavigator";
import { useAuthStore } from "./app/store/useAuthStore";
import { useBiomarkersStore } from "./app/store/useBiomarkersStore";

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  const { user, session, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
    if (user && session) {
      useBiomarkersStore.getState().setUserId(user.id);
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
      <Toast />
    </NavigationContainer>
  );
}
