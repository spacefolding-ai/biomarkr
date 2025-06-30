import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";
import { Biomarker } from "../types/Biomarker";

export async function getAllBiomarkers(): Promise<Biomarker[]> {
  try {
    const { data, error } = await supabase
      .from("biomarkers")
      .select("*")
      .order("report_date", { ascending: false });

    if (data) return data;
    if (error) throw new Error("Failed to load biomarkers: " + error);
  } catch (error) {
    throw new Error("Unexpected error: " + error);
  }
}

export async function createBiomarkerInDb(biomarkerData: {
  marker_name: string;
  value: number;
  unit: string;
  report_id: string;
  user_id: string;
  report_date: string;
}): Promise<Biomarker> {
  try {
    const newBiomarker: Omit<Biomarker, "id" | "created_at"> = {
      ...biomarkerData,
      reference_range: "",
      abnormal_flag: null,
      biomarker_group: undefined,
    };

    const { data, error } = await supabase
      .from("biomarkers")
      .insert(newBiomarker)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to create biomarker: " + error.message);
    }

    if (!data) {
      throw new Error("No data returned after creating biomarker");
    }

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Biomarker created successfully!",
    });

    return data;
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to create biomarker!",
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

export async function deleteAllBiomarkersFromDbByReportId(
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

export async function updateBiomarkerFavouriteStatus(
  biomarkerId: string,
  isFavourite: boolean
): Promise<void> {
  try {
    const { error } = await supabase
      .from("biomarkers")
      .update({ is_favourite: isFavourite })
      .eq("id", biomarkerId);

    if (error) {
      throw new Error("Failed to update favourite status: " + error.message);
    }

    Toast.show({
      type: "success",
      text1: "Success",
      text2: isFavourite ? "Added to favourites!" : "Removed from favourites!",
    });
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to update favourite status!",
    });
    throw new Error("Unexpected error: " + error);
  }
}
