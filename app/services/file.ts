import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";

export async function deleteAllFilesForReportFromDb(
  reportId: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("files")
      .delete()
      .eq("report_id", reportId);
    Toast.show({
      type: "success",
      text1: "Success",
      text2: "File deleted successfully!",
    });
    console.log("deleteAllFilesForReportFromDb: ", data);
    return data;
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to delete file!",
    });
    throw new Error("Unexpected error: " + error);
  }
}

export async function deleteFileFromDb(id: string): Promise<string> {
  try {
    const { data, error } = await supabase.from("files").delete().eq("id", id);
    Toast.show({
      type: "success",
      text1: "Success",
      text2: "File deleted successfully!",
    });
    console.log("deleteFileFromDb: ", data);
    return data;
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to delete file!",
    });
    throw new Error("Unexpected error: " + error);
  }
}
