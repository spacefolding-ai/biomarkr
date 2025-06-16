import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import BiomarkersScreen from "./BiomarkersScreen";
import LabDocumentsScreen from "./LabDocumentsScreen";
import { supabase } from "../services/supabaseClient";
import { useBiomarkersRealtime } from "../hooks/useBiomarkersRealtime";
import { useFilesRealtime } from "../hooks/useFilesRealtime";

const Tab = createMaterialTopTabNavigator();

const HealthLabScreen = () => {
  const [biomarkers, setBiomarkers] = useState([]);
  const [files, setFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadBiomarkers = async () => {
    const { data, error } = await supabase
      .from("biomarkers")
      .select("*")
      .order("report_date", { ascending: false });

    if (data) setBiomarkers(data);
    if (error) console.error("Failed to load biomarkers:", error);
  };

  const loadFiles = async () => {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (data) setFiles(data);
    if (error) console.error("Failed to load files:", error);
  };

  useEffect(() => {
    loadBiomarkers();
    loadFiles();
  }, []);

  useBiomarkersRealtime({
    onInsert: (payload) => {
      setBiomarkers((prev) => [payload, ...prev]);
    },
    onUpdate: (payload) => {
      setBiomarkers((prev) =>
        prev.map((item) => (item.id === payload.id ? payload : item))
      );
    },
  });

  useFilesRealtime({
    onInsert: (payload) => {
      const newFile = payload.new;
      setFiles((prev) => [newFile, ...prev]);
    },
    onUpdate: (payload) => {
      const updatedFile = payload.new;
      setFiles((prev) =>
        prev.map((item) => (item.id === updatedFile.id ? updatedFile : item))
      );
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBiomarkers();
    await loadFiles();
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
    <LabDocumentsScreen
      files={files}
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
