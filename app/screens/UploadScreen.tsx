import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Camera from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
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
  const { user, session, loading, initAuth } = useAuthStore();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const processFile = async (uri: string) => {
    if (!user?.id) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "User not authenticated",
      });
      return;
    }

    try {
      const info = await normalizeImage(uri, user.id);
      setFileInfo(info);
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Error", text2: error.message });
    }
  };

  const pickImage = async () => {
    try {
      console.log("User object:", user);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        await processFile(result.assets[0].uri);
      } else {
        console.log("Image picking was canceled");
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
    });

    if (result.assets && result.assets.length > 0) {
      await processFile(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      await processFile(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!fileInfo || !user?.id) {
      console.log("Upload failed: Missing fileInfo or user ID");
      return;
    }

    console.log("Uploading file:", fileInfo);
    console.log("User ID:", user.id);
    console.log("Normalized Uri: ", fileInfo.normalizedUri);

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
    // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      {!fileInfo ? (
        <>
          <Button
            title="Pick Image from Gallery"
            onPress={pickImage}
            disabled={!session}
          />
          <View style={styles.spacer} />
          <Button
            title="Pick Document (PDF, Image)"
            onPress={pickDocument}
            disabled={!session}
          />
          <View style={styles.spacer} />
          <Button
            title="Take Photo (Camera)"
            onPress={takePhoto}
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
