import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { getAllBiomarkers } from "../services/biomarkers";
import { getAllLabReports } from "../services/labReports";
import { useBiomarkersStore } from "../store/useBiomarkersStore";
import { useLabReportsStore } from "../store/useLabReportsStore";
import BiomarkersScreen from "./BiomarkersScreen";
import LabReportsScreen from "./LabReportsScreen";

const Tab = createMaterialTopTabNavigator();

const HealthLabScreen = () => {
  const { biomarkers, setBiomarkers } = useBiomarkersStore();
  const { reports, setReports } = useLabReportsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(0);

  const loadBiomarkers = async () => {
    try {
      const biomarkers = await getAllBiomarkers();
      setBiomarkers(biomarkers);
    } catch (error) {
      // Failed to load biomarkers
    }
  };

  const loadLabReports = async () => {
    try {
      const labReports = await getAllLabReports();
      setReports(labReports);
    } catch (error) {
      // Failed to load lab reports
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadBiomarkers(), loadLabReports()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Refresh data when screen comes into focus (e.g., after upload)
  // with debounce to prevent multiple rapid calls
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastRefresh > 2000) {
        // Debounce: only refresh if more than 2 seconds since last refresh
        setLastRefresh(now);
        loadAll();
      }
    }, [lastRefresh])
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadAll();
    } catch (error) {
      // Failed to refresh
    } finally {
      setRefreshing(false);
    }
  }, []);

  const BiomarkersTab = (props) => (
    <BiomarkersScreen
      biomarkers={biomarkers}
      refreshing={refreshing}
      onRefresh={onRefresh}
      {...props}
    />
  );

  const LabReportsTab = (props) => (
    <LabReportsScreen
      reports={reports}
      refreshing={refreshing}
      onRefresh={onRefresh}
      {...props}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarOnPress: ({ navigation, defaultHandler }) => {
            defaultHandler();
          },
        })}
      >
        <Tab.Screen name="Biomarkers" component={BiomarkersTab} />
        <Tab.Screen name="Lab Reports" component={LabReportsTab} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default HealthLabScreen;
