import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView } from "react-native";
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
    const { data, error } = await supabase
      .from("lab_reports")
      .select("*")
      .order("report_date", { ascending: false });

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
    onInsert: (payload: RealtimePostgresInsertPayload<Biomarker>) => {
      console.log("onInsert biomarkers", payload.new);
      setBiomarkers((prev: Biomarker[]) => {
        const existingIds = new Set(prev.map((item) => item.id));
        if (!existingIds.has(payload.new.id)) {
          return [payload.new, ...prev];
        }
        return prev;
      });
    },
    onUpdate: (payload: RealtimePostgresUpdatePayload<Biomarker>) => {
      setBiomarkers((prev: Biomarker[]) =>
        prev.map((item) => (item.id === payload.new.id ? payload.new : item))
      );
    },
    onDelete: (payload: RealtimePostgresDeletePayload<Biomarker>) => {
      setBiomarkers((prev: Biomarker[]) =>
        prev.filter((item) => item.id !== payload.old.id)
      );
    },
  });

  useLabReportsRealtime({
    onInsert: (payload: RealtimePostgresInsertPayload<LabReport>) => {
      const newReport = payload.new;
      console.log("onInsert reports", payload);
      setReports((prev: LabReport[]) => {
        const existingIds = new Set(prev.map((item) => item.id));
        if (!existingIds.has(newReport.id)) {
          return [newReport, ...prev];
        }
        return prev;
      });
    },
    onUpdate: (payload: RealtimePostgresUpdatePayload<LabReport>) => {
      setReports((prev: LabReport[]) =>
        prev.map((item) => (item.id === payload.new.id ? payload.new : item))
      );
    },
    onDelete: (payload: RealtimePostgresDeletePayload<LabReport>) => {
      setReports((prev: LabReport[]) =>
        prev.filter((item) => item.id !== payload.old.id)
      );
    },
  });

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadAll();
    } catch (error) {
      throw new Error("Failed to refresh:", error);
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

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

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
