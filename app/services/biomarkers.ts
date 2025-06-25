import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";
import { Biomarker } from "../types/Biomarker";

export async function deleteAllBiomarkersForReportFromDb(
  reportId: string
): Promise<void> {
  try {
    await supabase.from("biomarkers").delete().eq("report_id", reportId);
    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Biomarkers deleted successfully!",
    });
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to delete biomarkers!",
    });
    throw new Error("Unexpected error: " + error);
  }
}

export async function deleteBiomarkerFromDb(id: string): Promise<string> {
  try {
    await supabase.from("biomarkers").delete().eq("id", id);
    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Biomarker deleted successfully!",
    });
    return id;
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to delete biomarker!",
    });
    throw new Error("Unexpected error: " + error);
  }
}

export async function updateBiomarkerInDb(
  biomarker: Biomarker
): Promise<Biomarker> {
  try {
    await supabase.from("biomarkers").update(biomarker).eq("id", biomarker.id);
    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Biomarker updated successfully!",
    });
    return biomarker;
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to update biomarker!",
    });
    throw new Error("Unexpected error: " + error);
  }
}
