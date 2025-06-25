import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";
import { deleteAllBiomarkersForReportFromDb } from "./biomarkers";
import { deleteAllFilesForReportFromDb } from "./file";
import {
  deleteFileFromStorage,
  getAllFilesFromStorageByReportId,
} from "./storage";

export async function deleteLabReportFromDb(id: string): Promise<string> {
  try {
    const files = await getAllFilesFromStorageByReportId(id);
    for (const file of files) {
      await deleteFileFromStorage(file.name);
    }
    await deleteAllFilesForReportFromDb(id);
    await deleteAllBiomarkersForReportFromDb(id);
    await supabase.from("lab_reports").delete().eq("id", id);

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Lab report deleted successfully!",
    });
    return id;
  } catch (err) {
    console.error("Unexpected error:", err);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to delete lab report!",
    });
  }
}
