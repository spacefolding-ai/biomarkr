import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { FileInfo, normalizeImage } from "../utils/file";
import {
  generateFallbackFilename,
  generateTimestampFilename,
  getActualFilename,
} from "../utils/filename";

export interface MediaPickerResult {
  success: boolean;
  fileInfo?: FileInfo;
  error?: string;
}

/**
 * Picks an image from the device gallery
 */
export const pickImageFromGallery = async (
  userId: string,
  mediaLibraryPermission?: MediaLibrary.PermissionResponse | null
): Promise<MediaPickerResult> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset: ImagePicker.ImagePickerAsset = result.assets[0];

      // Try to get the actual filename
      const actualFilename = await getActualFilename(
        asset.uri,
        asset.fileName || generateFallbackFilename("image", "jpg"),
        mediaLibraryPermission
      );

      const fileInfo = await normalizeImage(
        actualFilename,
        asset.fileSize,
        asset.uri,
        userId
      );

      return { success: true, fileInfo };
    }

    return { success: false };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error picking image",
    };
  }
};

/**
 * Picks a document (PDF or image) from the device
 */
export const pickDocument = async (
  userId: string
): Promise<MediaPickerResult> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset: DocumentPicker.DocumentPickerAsset = result.assets[0];

      // DocumentPicker usually provides the actual filename
      const actualFilename =
        asset.name || generateFallbackFilename("document", "pdf");

      const fileInfo = await normalizeImage(
        actualFilename,
        asset.size,
        asset.uri,
        userId
      );

      return { success: true, fileInfo };
    }

    return { success: false };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error picking document",
    };
  }
};

/**
 * Takes a photo using the device camera
 */
export const takePhotoWithCamera = async (
  userId: string
): Promise<MediaPickerResult> => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset: ImagePicker.ImagePickerAsset = result.assets[0];

      // Camera photos don't have original filenames, so we generate a timestamp-based name
      const cameraFilename = generateTimestampFilename("jpg");

      const fileInfo = await normalizeImage(
        cameraFilename,
        asset.fileSize,
        asset.uri,
        userId
      );

      return { success: true, fileInfo };
    }

    return { success: false };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error taking photo",
    };
  }
};
