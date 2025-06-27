import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { FileInfo } from "../utils/file";

interface FilePreviewProps {
  fileInfo: FileInfo;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ fileInfo }) => {
  const isPDF = fileInfo.fileType.startsWith("application/pdf");

  return (
    <View style={styles.container}>
      {isPDF ? (
        <Text style={styles.pdfText}>PDF selected: {fileInfo.fileName}</Text>
      ) : (
        <Image
          source={{ uri: fileInfo.normalizedUri }}
          style={styles.imagePreview}
          onError={() => {}}
        />
      )}
      <Text style={styles.pathText}>Storage path: {fileInfo.storagePath}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
  pdfText: {
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
  },
  pathText: {
    marginVertical: 10,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
