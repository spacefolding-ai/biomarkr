import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import MimeTypes from "react-native-mime-types";
import { PDFDocument } from "react-native-pdf-lib";
import { v4 as uuidv4 } from "uuid";

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
  console.log("Type: ", type);
  console.log("Uri: ", uri);

  if (type === "image") {
    console.log("Generating preview for image: ", uri);

    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 100, height: 100 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log("Resized Image: ", result);
      return result.uri;
    } catch (error) {
      console.error("Error generating preview: ", error);
      throw error;
    }
  } else if (type === "pdf") {
    const pdfDoc = await PDFDocument.open(uri);
    const page = await pdfDoc.getPage(0);
    const imageUri = await page.render({ width: 100, height: 100 });
    return imageUri;
  }

  throw new Error("Unsupported file type");
}
