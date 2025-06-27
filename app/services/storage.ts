import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";
import { decode } from "../utils/file";

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function retryUpload<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
}

export async function uploadFileToStorage(
  uri: string,
  storagePath: string,
  mimeType: string
): Promise<{ id: string; path: string; fullPath: string }> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }

    // Check file size
    if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
      throw new Error(
        `File size (${Math.round(
          fileInfo.size / 1024 / 1024
        )}MB) exceeds the 10MB limit`
      );
    }

    const uploadOperation = async () => {
      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(storagePath, decode(fileContent), {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        throw error;
      }

      return data;
    };

    // Retry upload with exponential backoff
    const data = await retryUpload(uploadOperation, 3, 1000);

    return data;
  } catch (error: any) {
    // Provide more specific error messages
    if (error.message?.includes("timeout")) {
      throw new Error(
        "Upload timed out. Please check your internet connection and try again."
      );
    } else if (error.message?.includes("network")) {
      throw new Error("Network error. Please check your internet connection.");
    } else if (error.message?.includes("size")) {
      throw new Error(error.message);
    } else {
      throw new Error(error.message || "Failed to upload file");
    }
  }
}

export async function deleteFileFromStorage(path: string): Promise<void> {
  try {
    const { data, error } = await supabase.storage
      .from("uploads")
      .remove([path]);
    Toast.show({
      type: "success",
      text1: "Success",
      text2: "File deleted successfully!",
    });
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to delete file!",
    });
    throw new Error("Unexpected error: " + error);
  }
}

export async function deleteAllFilesFromStorageByReportId(
  reportId: string
): Promise<void> {
  try {
    // Step 1: Fetch all file paths from the database
    const { data: files, error: fetchError } = await supabase
      .from("files")
      .select("file_path, thumbnail_path")
      .eq("report_id", reportId);
    if (fetchError) {
      throw new Error(`Failed to fetch files: ${fetchError.message}`);
    }

    const filePathsToDelete = files
      .flatMap((f) => [f.file_path, f.thumbnail_path])
      .filter(Boolean); // remove null/undefined if any

    if (filePathsToDelete.length === 0) {
      return;
    }
    // Step 2: Delete from Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("uploads")
      .remove(filePathsToDelete);
    if (storageError) {
      throw new Error(`Failed to delete from storage: ${storageError.message}`);
    }
  } catch (error) {
    throw new Error("Unexpected error: " + error);
  }
}
