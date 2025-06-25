import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";
import { SupabaseStorageFile } from "../types/File";
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

export async function getAllFilesFromStorageByReportId(
  reportId: string
): Promise<SupabaseStorageFile[]> {
  try {
    const { data, error } = await supabase.storage
      .from("uploads")
      .list(`reports/${reportId}`);
    console.log("getAllFilesFromStorageByReportId: ", data);
    return (data ?? []) as unknown as SupabaseStorageFile[];
  } catch (error) {
    throw new Error("Unexpected error: " + error);
  }
}
