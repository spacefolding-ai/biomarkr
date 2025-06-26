import * as Camera from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import {
  pickDocument,
  pickImageFromGallery,
  takePhotoWithCamera,
} from "../services/mediaPicker";
import { FileInfo } from "../utils/file";

export const useMediaPicker = (userId?: string) => {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [cameraPermission, requestCameraPermission] =
    Camera.useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    MediaLibrary.usePermissions();

  useEffect(() => {
    requestCameraPermission();
    requestMediaLibraryPermission();
  }, []);

  const handlePickImage = async () => {
    if (!userId) return;

    const result = await pickImageFromGallery(userId, mediaLibraryPermission);

    if (result.success && result.fileInfo) {
      setFileInfo(result.fileInfo);
    } else if (result.error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: result.error,
      });
    }
  };

  const handlePickDocument = async () => {
    if (!userId) return;

    const result = await pickDocument(userId);

    if (result.success && result.fileInfo) {
      setFileInfo(result.fileInfo);
    } else if (result.error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: result.error,
      });
    }
  };

  const handleTakePhoto = async () => {
    if (!userId) return;

    const result = await takePhotoWithCamera(userId);

    if (result.success && result.fileInfo) {
      setFileInfo(result.fileInfo);
    } else if (result.error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: result.error,
      });
    }
  };

  const clearFileInfo = () => {
    setFileInfo(null);
  };

  return {
    fileInfo,
    handlePickImage,
    handlePickDocument,
    handleTakePhoto,
    clearFileInfo,
    cameraPermission,
    mediaLibraryPermission,
  };
};
