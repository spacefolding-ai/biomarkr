import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { downloadFileFromStorage } from "../services/storage";
import { LabReport } from "../types/LabReport";

interface DocumentsTabProps {
  labReport: LabReport;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ labReport }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!labReport.file_path || !labReport.file_name) {
      Alert.alert("Error", "No document available for download");
      return;
    }

    setIsDownloading(true);
    try {
      await downloadFileFromStorage(labReport.file_path, labReport.file_name);
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert("Error", "Failed to download document");
    } finally {
      setIsDownloading(false);
    }
  };

  const hasDocument = labReport.file_path && labReport.file_name;

  return (
    <View style={styles.container}>
      {hasDocument ? (
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>Document Available</Text>
          <Text style={styles.fileName}>{labReport.file_name}</Text>
          <TouchableOpacity
            style={[
              styles.downloadButton,
              isDownloading && styles.downloadButtonDisabled,
            ]}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            <Text style={styles.downloadButtonText}>
              {isDownloading ? "Downloading..." : "Download Document"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.message}>No documents available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  documentInfo: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  fileName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  downloadButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: "center",
  },
  downloadButtonDisabled: {
    backgroundColor: "#ccc",
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    flex: 1,
    textAlignVertical: "center",
  },
});
