import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../services/supabaseClient";

interface FileItem {
  id: string;
  user_id: string;
  file_path: string;
  original_file_name: string;
  uploaded_at: string;
  extraction_status: string;
  lab_report_id?: string;
}

interface LabDocumentsScreenProps {
  files: FileItem[];
  refreshing: boolean;
  onRefresh: () => void;
}

const LabDocumentsScreen: React.FC<LabDocumentsScreenProps> = ({
  files,
  refreshing,
  onRefresh,
}) => {
  const [localFiles, setLocalFiles] = useState<FileItem[]>([]);

  const renderFileItem = ({ item }: { item: FileItem }) => (
    <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#eee" }}>
      <Text>{item.original_file_name}</Text>
      <Text>{new Date(item.uploaded_at).toLocaleString()}</Text>

      {item.extraction_status === "pending" ? (
        <Text style={{ color: "orange" }}>Analyzing...</Text>
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
};

export default LabDocumentsScreen;
