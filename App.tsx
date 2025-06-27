import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  useFonts,
} from "@expo-google-fonts/roboto";
import { NavigationContainer } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-get-random-values";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";
import AppNavigator from "./app/navigation/AppNavigator";
import { useAuthStore } from "./app/store/useAuthStore";
import { useBiomarkersStore } from "./app/store/useBiomarkersStore";
import { useLabReportsStore } from "./app/store/useLabReportsStore";
import { useBiomarkersRealtime } from "./app/supabase/hooks/useBiomarkersRealtime";
import { useLabReportsRealtime } from "./app/supabase/hooks/useLabReportsRealtime";

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  const { user, session, initAuth } = useAuthStore();
  const { setUserId: setBiomarkersUserId } = useBiomarkersStore();
  const { setUserId: setLabReportsUserId } = useLabReportsStore();

  // Initialize realtime hooks
  useLabReportsRealtime();
  useBiomarkersRealtime();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    initAuth();
  }, []);

  // Set user IDs when user is available
  useEffect(() => {
    if (user && session) {
      setBiomarkersUserId(user.id);
      setLabReportsUserId(user.id);
    } else {
      setBiomarkersUserId(null);
      setLabReportsUserId(null);
    }
  }, [user, session]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
