import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native";
import { getAllBiomarkers } from "../services/biomarkers";
import { getAllLabReports } from "../services/labReports";
import { useBiomarkersStore } from "../store/useBiomarkersStore";
import { useLabReportsStore } from "../store/useLabReportsStore";
import BiomarkersScreen from "./BiomarkersScreen";
import LabReportsScreen from "./LabReportsScreen";

const Tab = createMaterialTopTabNavigator();

interface HealthLabScreenProps {
  navigation?: any;
}

const HealthLabScreen: React.FC<HealthLabScreenProps> = ({ navigation }) => {
  // Get data directly from stores (populated by polling system)
  const {
    biomarkers,
    setBiomarkers,
    setLoading: setBiomarkersLoading,
  } = useBiomarkersStore();
  const {
    reports,
    setReports,
    setLoading: setLabReportsLoading,
  } = useLabReportsStore();
  const [refreshing, setRefreshing] = useState(false);

  // Manual refresh function for pull-to-refresh (works with polling system)
  const loadBiomarkers = async () => {
    try {
      setBiomarkersLoading(true);
      const biomarkers = await getAllBiomarkers();
      setBiomarkers(biomarkers);
    } catch (error) {
      console.error("Failed to load biomarkers:", error);
    } finally {
      setBiomarkersLoading(false);
    }
  };

  const loadLabReports = async () => {
    try {
      setLabReportsLoading(true);
      const labReports = await getAllLabReports();
      setReports(labReports);
    } catch (error) {
      console.error("Failed to load lab reports:", error);
    } finally {
      setLabReportsLoading(false);
    }
  };

  const loadAll = async () => {
    console.log("🔄 Manual refresh triggered from HealthLabScreen");
    await Promise.all([loadBiomarkers(), loadLabReports()]);
  };

  // Note: We don't do initial loading here since polling system handles it
  // We only provide manual refresh capability for pull-to-refresh

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
      navigation={navigation}
      {...props}
    />
  );

  const LabReportsTab = (props) => (
    <LabReportsScreen
      refreshing={refreshing}
      onRefresh={onRefresh}
      navigation={navigation}
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
