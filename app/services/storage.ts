import * as FileSystem from "expo-file-system";
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
