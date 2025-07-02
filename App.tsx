import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  useFonts,
} from "@expo-google-fonts/roboto";
import { NavigationContainer } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { memo, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-get-random-values";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";
import AppNavigator from "./app/navigation/AppNavigator";
import { useAuthStore } from "./app/store/useAuthStore";
import { useBiomarkersStore } from "./app/store/useBiomarkersStore";
import { useLabReportsStore } from "./app/store/useLabReportsStore";

// Memoized component to prevent excessive re-renders
const RealtimeSubscriptions = memo(() => {
  const { user } = useAuthStore();

  console.log("🔄 RealtimeSubscriptions component rendered");
  console.log("👤 User in RealtimeSubscriptions:", user?.id || "No user");

  // DISABLED: Realtime subscriptions are causing CLOSED status issues
  // TODO: Re-enable once realtime issues are resolved
  // useLabReportsRealtime();
  // useBiomarkersRealtime();

  return null;
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  const { user, session, initAuth } = useAuthStore();
  const { setUserId: setBiomarkersUserId } = useBiomarkersStore();
  const { setUserId: setLabReportsUserId } = useLabReportsStore();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    initAuth();
  }, []);

  // Set user IDs when user is available (keeping for backward compatibility with other parts)
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
        <RealtimeSubscriptions />
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
