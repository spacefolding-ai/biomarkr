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
import { useBiomarkersPolling } from "./app/hooks/useBiomarkersPolling";
import { useLabReportsPolling } from "./app/hooks/useLabReportsPolling";
import AppNavigator from "./app/navigation/AppNavigator";
import { useAuthStore } from "./app/store/useAuthStore";
import { useBiomarkersStore } from "./app/store/useBiomarkersStore";
import { useLabReportsStore } from "./app/store/useLabReportsStore";

// Memoized component to prevent excessive re-renders and handle data syncing
const DataSyncManager = memo(() => {
  const { user } = useAuthStore();

  // Use polling for biomarkers (less frequent updates)
  const {
    refresh: refreshBiomarkers,
    refreshAndStop: refreshBiomarkersAndStop,
    resumePolling: resumeBiomarkersPolling,
    isPolling: biomarkersPolling,
  } = useBiomarkersPolling({
    interval: 15000, // 15 seconds
    enabled: !!user?.id,
  });

  // Use polling for lab reports (smart intervals based on processing status)
  const {
    refresh: refreshLabReports,
    isPolling: labReportsPolling,
    hasActiveReports,
    allReportsCompleted,
  } = useLabReportsPolling({
    activeInterval: 3000, // 3 seconds when processing
    inactiveInterval: 10000, // 10 seconds when idle
    enabled: !!user?.id,
    onReportCompleted: (reportId, reportData) => {
      console.log("🎉 Lab report extraction completed!", {
        reportId,
        laboratory_name: reportData.laboratory_name,
        status: reportData.extraction_status,
      });
      console.log(
        "🔄 Triggering immediate biomarkers refresh and stopping polling..."
      );
      refreshBiomarkersAndStop();
    },
  });

  // Resume biomarkers polling when new reports start processing
  useEffect(() => {
    if (user?.id && hasActiveReports && !biomarkersPolling) {
      console.log(
        "🔄 New reports are processing - resuming biomarkers polling"
      );
      resumeBiomarkersPolling();
    }
  }, [user?.id, hasActiveReports, biomarkersPolling, resumeBiomarkersPolling]);

  // Log polling status for debugging
  useEffect(() => {
    if (user?.id) {
      const labReportsStatus = allReportsCompleted
        ? "COMPLETED"
        : hasActiveReports
        ? "ACTIVE"
        : "INACTIVE";

      console.log(
        `📊 Polling Status - Lab Reports: ${
          labReportsPolling ? labReportsStatus : "STOPPED"
        }, Biomarkers: ${
          biomarkersPolling ? "POLLING" : "STOPPED"
        }, Has Processing Reports: ${hasActiveReports}, All Completed: ${allReportsCompleted}`
      );
    }
  }, [
    user?.id,
    labReportsPolling,
    biomarkersPolling,
    hasActiveReports,
    allReportsCompleted,
  ]);

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
        <DataSyncManager />
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
