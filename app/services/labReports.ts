import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";

export async function removeLabReport(id: string): Promise<string> {
  try {
    await supabase.from("files").delete().eq("lab_report_id", id);
    await supabase.from("lab_reports").delete().eq("id", id);
    await supabase.from("biomarkers").delete().eq("lab_report_id", id);

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
