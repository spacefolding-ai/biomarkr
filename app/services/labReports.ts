import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";
import { LabReport } from "../types/LabReport";
import { deleteAllBiomarkersFromDbByReportId } from "./biomarkers";
import { deleteAllFilesFromDbByReportId } from "./file";
import { deleteAllFilesFromStorageByReportId } from "./storage";

export async function getAllLabReports(): Promise<LabReport[]> {
  try {
    const { data, error } = await supabase
      .from("lab_reports")
      .select("*")
      .order("report_date", { ascending: false });

    if (data) return data;
    if (error) throw new Error("Failed to load lab reports: " + error);
  } catch (error) {
    throw new Error("Unexpected error: " + error);
  }
}

// Test function to check lab_reports table accessibility and realtime capabilities
export async function testLabReportsAccess(userId: string): Promise<void> {
  try {
    console.log("🧪 Testing lab_reports table access and realtime...");

    // Test 1: Basic table access
    console.log("🔍 Test 1: Basic SELECT access");
    const { data: selectData, error: selectError } = await supabase
      .from("lab_reports")
      .select("*")
      .limit(1);

    if (selectError) {
      console.error("❌ SELECT failed:", selectError);
    } else {
      console.log(
        "✅ SELECT success, found",
        selectData?.length || 0,
        "records"
      );
    }

    // Test 2: Check table schema
    console.log("🔍 Test 2: Table schema check");
    const { data: schemaData, error: schemaError } = await supabase
      .from("lab_reports")
      .select("user_id")
      .limit(1);

    if (schemaError) {
      console.error("❌ Schema check failed:", schemaError);
    } else {
      console.log("✅ Schema check passed - user_id column exists");
    }

    // Test 3: User-specific query
    console.log("🔍 Test 3: User-specific query");
    const { data: userData, error: userError } = await supabase
      .from("lab_reports")
      .select("*")
      .eq("user_id", userId)
      .limit(1);

    if (userError) {
      console.error("❌ User query failed:", userError);
    } else {
      console.log(
        "✅ User query success, found",
        userData?.length || 0,
        "user records"
      );
    }

    // Test 4: Try a simple realtime subscription
    // DISABLED: Realtime subscriptions disabled to avoid CLOSED status issues
    // console.log("🔍 Test 4: Simple realtime subscription test");
    // const testChannelName = `test_lab_reports_${Date.now()}`;
    // const testChannel = supabase.channel(testChannelName);

    // let subscriptionResult = "pending";

    // testChannel
    //   .on(
    //     "postgres_changes",
    //     { event: "INSERT", schema: "public", table: "lab_reports" },
    //     (payload) => {
    //       console.log("🧪 Test realtime event received:", payload);
    //     }
    //   )
    //   .subscribe((status) => {
    //     console.log("🧪 Test subscription status:", status);
    //     subscriptionResult = status;

    //     if (status === "SUBSCRIBED") {
    //       console.log("✅ Test subscription successful");
    //       // Clean up test subscription
    //       setTimeout(() => {
    //         testChannel.unsubscribe();
    //         console.log("🧹 Test subscription cleaned up");
    //       }, 1000);
    //     } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
    //       console.error("❌ Test subscription failed:", status);
    //       testChannel.unsubscribe();
    //     } else if (status === "CLOSED") {
    //       console.warn("⚠️ Test subscription was closed");
    //     }
    //   });

    // // Wait a bit to see the subscription result
    // setTimeout(() => {
    //   if (subscriptionResult === "pending") {
    //     console.warn("⚠️ Test subscription still pending after 2 seconds");
    //     testChannel.unsubscribe();
    //   }
    // }, 2000);
  } catch (error) {
    console.error("❌ Test function error:", error);
  }
}

// Debug function to check what's actually in the database
export async function debugLabReports(userId: string): Promise<void> {
  try {
    console.log("🔍 Debug: Checking lab_reports table for user:", userId);

    // First run the access test
    await testLabReportsAccess(userId);

    // Get all lab reports for this user
    const { data: userReports, error: userError } = await supabase
      .from("lab_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (userError) {
      console.error("❌ Error fetching user lab reports:", userError);
      return;
    }

    console.log(
      `📊 Found ${userReports?.length || 0} lab reports for user ${userId}:`
    );
    userReports?.forEach((report, index) => {
      console.log(`  ${index + 1}. ID: ${report.id}`);
      console.log(`     Lab: ${report.laboratory_name || "N/A"}`);
      console.log(`     Status: ${report.extraction_status || "N/A"}`);
      console.log(`     Created: ${report.created_at || "N/A"}`);
      console.log(`     User ID: ${report.user_id}`);
    });

    // Also check the most recent 5 lab reports across all users to see if n8n is creating any
    const { data: recentReports, error: recentError } = await supabase
      .from("lab_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentError) {
      console.error("❌ Error fetching recent lab reports:", recentError);
      return;
    }

    console.log(`🕐 Most recent 5 lab reports in system:`);
    recentReports?.forEach((report, index) => {
      console.log(`  ${index + 1}. ID: ${report.id}`);
      console.log(`     Lab: ${report.laboratory_name || "N/A"}`);
      console.log(`     Status: ${report.extraction_status || "N/A"}`);
      console.log(`     User ID: ${report.user_id}`);
      console.log(`     Created: ${report.created_at || "N/A"}`);
    });
  } catch (error) {
    console.error("❌ Debug function error:", error);
  }
}

export async function updateLabReportInDb(
  report: LabReport
): Promise<LabReport> {
  try {
    const { data, error } = await supabase
      .from("lab_reports")
      .update({
        report_date: report.report_date,
        laboratory_name: report.laboratory_name,
        notes: report.notes,
      })
      .eq("id", report.id)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to update lab report: " + error.message);
    }

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Lab report updated successfully!",
    });

    return data;
  } catch (err) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to update lab report!",
    });
    throw err;
  }
}

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
    // Unexpected error
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to delete lab report!",
    });
  }
}
