import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";
import { decode } from "../utils/file";

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
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new Error(error.message || "Failed to upload file");
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
    console.log(data);
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
      .select("file_path")
      .eq("report_id", reportId);
    console.log("files: ", files);
    if (fetchError) {
      throw new Error(`Failed to fetch files: ${fetchError.message}`);
    }

    const filePaths = files?.map((f) => f.file_path) ?? [];

    if (filePaths.length === 0) {
      console.log(`No files found for report_id: ${reportId}`);
      return;
    }
    console.log("filePaths: ", filePaths);
    // Step 2: Delete from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("uploads")
      .remove(filePaths);

    if (storageError) {
      throw new Error(`Failed to delete from storage: ${storageError.message}`);
    }
  } catch (error) {
    throw new Error("Unexpected error: " + error);
  }
}
