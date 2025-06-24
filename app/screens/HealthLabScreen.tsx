import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { useBiomarkersStore } from "../store/useBiomarkersStore";
import { useLabReportsStore } from "../store/useLabReportsStore";
import { supabase } from "../supabase/supabaseClient";
import BiomarkersScreen from "./BiomarkersScreen";
import LabReportsScreen from "./LabReportsScreen";

const Tab = createMaterialTopTabNavigator();

const HealthLabScreen = () => {
  const { biomarkers, setBiomarkers } = useBiomarkersStore();
  const { reports, setReports } = useLabReportsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBiomarkers = async () => {
    const { data, error } = await supabase
      .from("biomarkers")
      .select("*")
      .order("report_date", { ascending: false });

    if (data) setBiomarkers(data);
    if (error) console.error("Failed to load biomarkers:", error);
  };

  const loadLabReports = async () => {
    const { data, error } = await supabase
      .from("lab_reports")
      .select("*")
      .order("report_date", { ascending: false });

    if (data) setReports(data);
    if (error) console.error("Failed to load lab reports:", error);
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadBiomarkers(), loadLabReports()]);
    setLoading(false);
  };

  useEffect(() => {
    console.log("HealthLabScreen mounted");
    loadAll();
    return () => {
      console.log("HealthLabScreen unmounted");
    };
  }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadAll();
    } catch (error) {
      console.error("Failed to refresh:", error);
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
