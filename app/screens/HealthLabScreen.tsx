import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import BiomarkersScreen from "./BiomarkersScreen";
import LabReportsScreen from "./LabReportsScreen";
import { supabase } from "../services/supabaseClient";
import { useBiomarkersRealtime } from "../hooks/useBiomarkersRealtime";
import { useLabReportsRealtime } from "../hooks/useLabReportsRealtime";

const Tab = createMaterialTopTabNavigator();

const HealthLabScreen = () => {
  const [biomarkers, setBiomarkers] = useState([]);
  const [reports, setReports] = useState([]);
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
  }, []);

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
      <Tab.Navigator>
        <Tab.Screen name="Biomarkers" component={BiomarkersTab} />
        <Tab.Screen name="Lab Reports" component={LabReportsTab} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default HealthLabScreen;
