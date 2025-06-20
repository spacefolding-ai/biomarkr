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
    const { data, error } = await supabase.from("lab_reports").select("*");
    // .order("report_date", { ascending: false });

    if (data) setReports(data);
    if (error) console.error("Failed to load lab reports:", error);
  };

  const loadAll = async () => {
    setLoading(true);
    await loadBiomarkers();
    await loadLabReports();
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useBiomarkersRealtime({
    onInsert: ({ new: newBiomarker }) => {
      console.log("onInsert biomarkers", newBiomarker);
      setBiomarkers((prev) =>
        prev.some((item) => item.id === newBiomarker.id)
          ? prev
          : [newBiomarker, ...prev]
      );
    },
    onUpdate: ({ new: updatedBiomarker }) => {
      setBiomarkers((prev) =>
        prev.map((item) =>
          item.id === updatedBiomarker.id ? updatedBiomarker : item
        )
      );
    },
    onDelete: ({ old: deletedBiomarker }) => {
      setBiomarkers((prev) =>
        prev.filter((item) => item.id !== deletedBiomarker.id)
      );
    },
  });

  useLabReportsRealtime({
    onInsert: ({ new: newReport }) => {
      console.log("onInsert reports", newReport);
      setReports((prev) =>
        prev.some((item) => item.id === newReport.id)
          ? prev
          : [newReport, ...prev]
      );
    },
    onUpdate: ({ new: updatedReport }) => {
      console.log("onUpdate reports", updatedReport);
      setReports((prev) =>
        prev.map((item) =>
          item.id === updatedReport.id ? updatedReport : item
        )
      );
    },
    onDelete: ({ old: deletedReport }) => {
      console.log("onDelete reports", deletedReport);
      setReports((prev) => prev.filter((item) => item.id !== deletedReport.id));
    },
  });

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
