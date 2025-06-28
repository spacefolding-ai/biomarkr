import React from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  View,
} from "react-native";

interface UploadActionsProps {
  onUpload: () => void;
  onCancel: () => void;
  uploading: boolean;
  checkForDuplicate?: () => Promise<{
    isDuplicate: boolean;
    existingFile?: any;
  }>;
  fileUri?: string;
}

export const UploadActions: React.FC<UploadActionsProps> = ({
  onUpload,
  onCancel,
  uploading,
  checkForDuplicate,
  fileUri,
}) => {
  const handleUploadWithDuplicateCheck = async () => {
    if (checkForDuplicate && fileUri) {
      try {
        const { isDuplicate, existingFile } = await checkForDuplicate();

        if (isDuplicate) {
          Alert.alert(
            "Duplicate File Detected",
            `This file has already been uploaded as "${
              existingFile?.original_file_name
            }" on ${new Date(
              existingFile?.uploaded_at
            ).toLocaleDateString()}.\n\nWould you like to upload it anyway?`,
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Upload Anyway",
                style: "default",
                onPress: () => onUpload(),
              },
            ]
          );
          return;
        }
      } catch (error) {
        console.error("Error checking for duplicates:", error);
        // If duplicate check fails, proceed with upload
      }
    }

    // Proceed with upload if no duplicate or check failed
    onUpload();
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Button
          title="Upload"
          onPress={handleUploadWithDuplicateCheck}
          disabled={uploading}
        />
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
