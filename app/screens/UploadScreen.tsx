import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Camera from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { RootStackParamList } from "../navigation/types";
import { uploadFileAndInsertToDb } from "../services/upload";
import { useAuthStore } from "../store/useAuthStore";
import { FileInfo, normalizeImage } from "../utils/file";

export default function UploadScreen() {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraPermission, requestCameraPermission] =
    Camera.useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    MediaLibrary.usePermissions();
  const { user, session, loading } = useAuthStore();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  useEffect(() => {
    requestCameraPermission();
    requestMediaLibraryPermission();
  }, []);

  // Helper function to try to get the actual filename
  const getActualFilename = async (
    uri: string,
    fallbackName: string
  ): Promise<string> => {
    try {
      if (mediaLibraryPermission?.granted) {
        // Try to get asset info from MediaLibrary
        const asset = await MediaLibrary.getAssetInfoAsync(uri);
        if (asset && asset.filename) {
          return asset.filename;
        }
      }
    } catch (error) {
      // MediaLibrary failed
    }

    // Fallback 1: Try to extract meaningful name from URI path
    try {
      const uriParts = uri.split("/");
      const lastPart = uriParts[uriParts.length - 1];

      // Remove query parameters if any
      const filenamePart = lastPart.split("?")[0];

      // Check if it looks like a real filename (contains letters, not just UUID pattern)
      if (
        filenamePart &&
        filenamePart.includes(".") &&
        !filenamePart.match(/^[A-F0-9-]{8,}\.(jpg|jpeg|png|pdf)$/i) &&
        filenamePart.length > 5
      ) {
        return filenamePart;
      }
    } catch (error) {
      // Failed to extract filename from URI
    }

    // Fallback 2: Use the provided fallback name
    return fallbackName;
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset: ImagePicker.ImagePickerAsset = result.assets[0];

        // Try to get the actual filename
        const actualFilename = await getActualFilename(
          asset.uri,
          asset.fileName || `image_${Date.now()}.jpg`
        );

        const info = await normalizeImage(
          actualFilename,
          asset.fileSize,
          asset.uri,
          user.id
        );
        setFileInfo(info);
      }
    } catch (error) {
      // Error picking image
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset: DocumentPicker.DocumentPickerAsset = result.assets[0];

        // DocumentPicker usually provides the actual filename
        const actualFilename = asset.name || `document_${Date.now()}.pdf`;

        const info = await normalizeImage(
          actualFilename,
          asset.size,
          asset.uri,
          user.id
        );
        setFileInfo(info);
      }
    } catch (error) {
      // Error picking document
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset: ImagePicker.ImagePickerAsset = result.assets[0];

        // Camera photos don't have original filenames, so we generate a timestamp-based name
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const cameraFilename = `photo_${timestamp}.jpg`;

        const info = await normalizeImage(
          cameraFilename,
          asset.fileSize,
          asset.uri,
          user.id
        );
        setFileInfo(info);
      }
    } catch (error) {
      // Error taking photo
    }
  };

  const handleUpload = async () => {
    if (!fileInfo || !user?.id) {
      return;
    }

    try {
      setUploading(true);
      await uploadFileAndInsertToDb(
        fileInfo.normalizedUri,
        fileInfo.fileName,
        user.id
      );
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "File uploaded successfully",
      });
      setFileInfo(null);
      navigation.navigate("Health Lab", {
        screen: "Lab Reports",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFileInfo(null);
  };

  return (
    <View style={styles.container}>
      {!fileInfo ? (
        <>
          <Button
            title="Pick Image from Gallery"
            onPress={handlePickImage}
            disabled={!session}
          />
          <View style={styles.spacer} />
          <Button
            title="Pick Document (PDF, Image)"
            onPress={handlePickDocument}
            disabled={!session}
          />
          <View style={styles.spacer} />
          <Button
            title="Take Photo (Camera)"
            onPress={handleTakePhoto}
            disabled={!session}
          />
        </>
      ) : (
        <View style={styles.centeredContent}>
          {fileInfo.fileType.startsWith("application/pdf") ? (
            <Text style={styles.centeredText}>
              PDF selected: {fileInfo.fileName}
            </Text>
          ) : (
            <Image
              source={{ uri: fileInfo.normalizedUri }}
              style={styles.imagePreview}
              onError={() => {}}
            />
          )}
          <Text style={styles.pathText}>
            Storage path: {fileInfo.storagePath}
          </Text>
          <View style={styles.buttonRow}>
            <Button title="Upload" onPress={handleUpload} />
            <Button title="Cancel" onPress={handleCancel} />
          </View>
        </View>
      )}

      {uploading && (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  spacer: { marginVertical: 10 },
  imagePreview: { width: 200, height: 200, marginVertical: 10 },
  pathText: { marginVertical: 10, fontSize: 12, color: "#666" },
  centeredContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  centeredText: { textAlign: "center", marginVertical: 10 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 10,
  },
});
