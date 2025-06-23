import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import MimeTypes from "react-native-mime-types";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../services/supabaseClient";

export interface FileInfo {
  normalizedUri: string;
  fileType: string;
  fileName: string;
  storagePath: string;
}

export function generateUniqueFilePath(uri: string, userId: string): string {
  const fileName = uri.split("/").pop() || "";
  const fileType = fileName.split(".").pop()?.toLowerCase() || "";
  const mimeType = MimeTypes.lookup(fileType) || "application/octet-stream";
  const fileExtension = MimeTypes.extension(mimeType)
    ? `.${MimeTypes.extension(mimeType)}`
    : "";
  const uniqueFileName = `${uuidv4()}${fileExtension}`;

  return `reports/${userId}/${uniqueFileName}`;
}

export async function normalizeImage(
  uri: string,
  userId: string
): Promise<FileInfo> {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    throw new Error("File does not exist");
  }

  const fileName = uri.split("/").pop() || "";
  const fileType = fileName.split(".").pop()?.toLowerCase() || "";

  // If it's a HEIC/HEIF image on iOS, convert it to PNG
  if (fileType === "heic" || fileType === "heif") {
    const newUri = uri.replace(/\.(heic|heif)$/i, ".png");
    await FileSystem.copyAsync({
      from: uri,
      to: newUri,
    });
    const storagePath = generateUniqueFilePath(newUri, userId);
    return {
      normalizedUri: newUri,
      fileType: "image/png",
      fileName: fileName.replace(/\.(heic|heif)$/i, ".png"),
      storagePath,
    };
  }

  // Ensure correct MIME type for PDF files
  if (fileType === "pdf") {
    return {
      normalizedUri: uri,
      fileType: "application/pdf",
      fileName,
      storagePath: generateUniqueFilePath(uri, userId),
    };
  }

  const storagePath = generateUniqueFilePath(uri, userId);
  return {
    normalizedUri: uri,
    fileType: `image/${fileType}`,
    fileName,
    storagePath,
  };
}

export async function generatePreview(
  uri: string,
  type: string
): Promise<string> {
  if (type === "image") {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 100, height: 100 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      return result.uri;
    } catch (error) {
      throw error;
    }
  }

  throw new Error("Unsupported file type");
}

export async function getImageUrl(
  path: string,
  isPublic = true
): Promise<string | null> {
  const [bucket, ...rest] = path.split("/");
  const key = rest.join("/");

  if (isPublic) {
    return supabase.storage.from(bucket).getPublicUrl(key).data.publicUrl;
  }

  const { data } = await supabase.storage.from(bucket).createSignedUrl(key, 60);
  return data?.signedUrl ?? null;
}
