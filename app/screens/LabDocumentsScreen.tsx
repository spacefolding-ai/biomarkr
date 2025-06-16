import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../services/supabaseClient";
import { useFilesRealtime } from "../hooks/useFilesRealtime";

interface FileItem {
  id: string;
  user_id: string;
  file_path: string;
  original_file_name: string;
  uploaded_at: string;
  extraction_status: string;
  lab_report_id?: string;
}

export default function LabDocumentsScreen() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFiles = async () => {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (data) setFiles(data);
    if (error) console.error("Failed to load files:", error);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useFilesRealtime({
    onInsert: (payload) => {
      const newFile = payload.new as FileItem;
      setFiles((prev) => [newFile, ...prev]);
    },

    onUpdate: (payload) => {
      const updatedFile = payload.new as FileItem;
      setFiles((prev) =>
        prev.map((file) => (file.id === updatedFile.id ? updatedFile : file))
      );
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFiles();
    setRefreshing(false);
  }, []);

  const renderFileItem = ({ item }: { item: FileItem }) => (
    <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#eee" }}>
      <Text>{item.original_file_name}</Text>
      <Text>{new Date(item.uploaded_at).toLocaleString()}</Text>

      {item.extraction_status === "pending" ? (
        <Text style={{ color: "orange" }}>Loading...</Text>
      ) : (
        <Text style={{ color: "green" }}>Extracted ✅</Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={renderFileItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
