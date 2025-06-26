import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { FilePreview } from "../components/FilePreview";
import { MediaPickerButtons } from "../components/MediaPickerButtons";
import { UploadActions } from "../components/UploadActions";
import { useFileUpload } from "../hooks/useFileUpload";
import { useMediaPicker } from "../hooks/useMediaPicker";
import { useAuthStore } from "../store/useAuthStore";

export default function UploadScreen() {
  const { user, session, loading } = useAuthStore();
  const { uploading, uploadFile } = useFileUpload();
  const {
    fileInfo,
    handlePickImage,
    handlePickDocument,
    handleTakePhoto,
    clearFileInfo,
  } = useMediaPicker(user?.id);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleUpload = async () => {
    if (!fileInfo || !user?.id) return;

    const success = await uploadFile(fileInfo, user.id);
    if (success) {
      clearFileInfo();
    }
  };

  const handleCancel = () => {
    clearFileInfo();
  };

  return (
    <View style={styles.container}>
      {!fileInfo ? (
        <MediaPickerButtons
          onPickImage={handlePickImage}
          onPickDocument={handlePickDocument}
          onTakePhoto={handleTakePhoto}
          disabled={!session}
        />
      ) : (
        <View style={styles.previewContainer}>
          <FilePreview fileInfo={fileInfo} />
          <UploadActions
            onUpload={handleUpload}
            onCancel={handleCancel}
            uploading={uploading}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
