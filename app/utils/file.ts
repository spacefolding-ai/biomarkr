import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import MimeTypes from "react-native-mime-types";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabase/supabaseClient";

export interface FileInfo {
  normalizedUri: string;
  fileType: string;
  fileName: string;
  storagePath: string;
  originalFileName?: string;
  fileSize?: number;
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
  fileName: string,
  fileSize: number,
  fileUri: string,
  userId: string
): Promise<FileInfo> {
  const originalFileName = fileName;
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error("File does not exist");
  }

  const fileNameFromUri = fileUri.split("/").pop() || "";
  const fileType = fileName.split(".").pop()?.toLowerCase() || "";

  // If it's a HEIC/HEIF image on iOS, convert it to PNG
  if (fileType === "heic" || fileType === "heif") {
    const newUri = fileUri.replace(/\.(heic|heif)$/i, ".png");
    await FileSystem.copyAsync({
      from: fileUri,
      to: newUri,
    });
    const storagePath = generateUniqueFilePath(newUri, userId);
    return {
      normalizedUri: newUri,
      fileType: "image/png",
      originalFileName: originalFileName,
      fileSize: fileSize,
      fileName: fileNameFromUri.replace(/\.(heic|heif)$/i, ".png"),
      storagePath,
    };
  }

  // Ensure correct MIME type for PDF files
  if (fileType === "pdf") {
    return {
      normalizedUri: fileUri,
      fileType: "application/pdf",
      fileName: fileNameFromUri,
      originalFileName: originalFileName,
      fileSize: fileSize,
      storagePath: generateUniqueFilePath(fileUri, userId),
    };
  }

  // For images, compress if they're too large
  let processedUri = fileUri;
  if (fileType === "jpg" || fileType === "jpeg" || fileType === "png") {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileSize && fileSize > maxSize) {
      try {
        const result = await ImageManipulator.manipulateAsync(
          fileUri,
          [{ resize: { width: 2048 } }], // Resize to max width of 2048px
          {
            compress: 0.8,
            format:
              fileType === "png"
                ? ImageManipulator.SaveFormat.PNG
                : ImageManipulator.SaveFormat.JPEG,
          }
        );
        processedUri = result.uri;
      } catch (compressionError) {
        // Continue with original if compression fails
      }
    }
  }

  const storagePath = generateUniqueFilePath(processedUri, userId);
  return {
    normalizedUri: processedUri,
    fileType: `image/${fileType}`,
    fileName: fileNameFromUri,
    storagePath,
    originalFileName: originalFileName,
    fileSize: fileSize,
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

  // Skip preview generation for PDFs
  if (type === "pdf") {
    return uri; // Return the original URI for PDFs
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

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
