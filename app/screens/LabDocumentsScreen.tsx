import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
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

  // Initial load of files when screen mounts
  useEffect(() => {
    const loadFiles = async () => {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (data) setFiles(data);
      if (error) console.error("Failed to load files:", error);
    };

    loadFiles();
  }, []);

  // Realtime hook
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
      />
    </View>
  );
}
