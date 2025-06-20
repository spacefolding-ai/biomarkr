import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { useBiomarkersRealtime } from "../hooks/useBiomarkersRealtime";
import { useLabReportsRealtime } from "../hooks/useLabReportsRealtime";
import { supabase } from "../services/supabaseClient";
import { Biomarker } from "../types/Biomarker";
import { LabReport } from "../types/LabReport";
import BiomarkersScreen from "./BiomarkersScreen";
import LabReportsScreen from "./LabReportsScreen";

const Tab = createMaterialTopTabNavigator();

const HealthLabScreen = () => {
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([] as Biomarker[]);
  const [reports, setReports] = useState<LabReport[]>([] as LabReport[]);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    loadBiomarkers();
    loadLabReports();
  }, [setBiomarkers, setReports]);

  useBiomarkersRealtime({
    onInsert: (payload) => {
      console.log("onInsert biomarkers", payload);
      setBiomarkers((prev) => [payload, ...prev]);
    },
    onUpdate: (payload) => {
      setBiomarkers((prev) =>
        prev.map((item) => (item.id === payload.id ? payload : item))
      );
    },
    onDelete: (payload) => {
      setBiomarkers((prev) => prev.filter((item) => item.id !== payload.id));
    },
  });

  useLabReportsRealtime({
    onInsert: (payload) => {
      console.log("onInsert reports", payload);
      setReports((prev) => [payload, ...prev]);
    },
    onUpdate: (payload) => {
      setReports((prev) =>
        prev.map((item) => (item.id === payload.id ? payload : item))
      );
    },
    onDelete: (payload) => {
      setReports((prev) => prev.filter((item) => item.id !== payload.id));
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBiomarkers();
    await loadLabReports();
    setRefreshing(false);
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
