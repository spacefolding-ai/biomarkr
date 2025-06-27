import React from "react";
import { ActivityIndicator, Button, StyleSheet, View } from "react-native";

interface UploadActionsProps {
  onUpload: () => void;
  onCancel: () => void;
  uploading: boolean;
}

export const UploadActions: React.FC<UploadActionsProps> = ({
  onUpload,
  onCancel,
  uploading,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Button title="Upload" onPress={onUpload} disabled={uploading} />
        <Button title="Cancel" onPress={onCancel} disabled={uploading} />
      </View>
      {uploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 10,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});
