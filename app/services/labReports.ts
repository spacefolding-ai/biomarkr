import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";
import { deleteAllBiomarkersFromDbByReportId } from "./biomarkers";
import { deleteAllFilesFromDbByReportId } from "./file";
import { deleteAllFilesFromStorageByReportId } from "./storage";

export async function deleteLabReportFromDb(id: string): Promise<string> {
  try {
    await deleteAllFilesFromStorageByReportId(id);
    await deleteAllFilesFromDbByReportId(id);
    await deleteAllBiomarkersFromDbByReportId(id);
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
