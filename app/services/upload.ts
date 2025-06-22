import { v4 as uuidv4 } from "uuid";
import { generatePreview } from "../utils/file";
import { uploadFileToStorage } from "./storage";
import { supabase } from "./supabaseClient";

// Simplified mime resolver
function getMimeType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
}

export async function uploadFileAndInsertToDb(
  fileUri: string,
  fileName: string,
  userId: string
) {
  const fileExt = fileName.split(".").pop()?.toLowerCase();
  const mimeType = getMimeType(fileName);
  const uniqueFileName = `${uuidv4()}.${fileExt}`;
  const filePath = `reports/${userId}/${uniqueFileName}`;

  // Upload the main file
  const fileData = await uploadFileToStorage(fileUri, filePath, mimeType);
  if (!fileData) throw new Error("File upload failed");

  // Generate and upload the thumbnail
  const previewUri = await generatePreview(
    fileUri,
    mimeType.startsWith("image") ? "image" : "pdf"
  );
  const previewFileName = `thumb_${uniqueFileName}`;
  const previewFilePath = `reports/${userId}/${previewFileName}`;
  const thumbData = await uploadFileToStorage(
    previewUri,
    previewFilePath,
    "image/jpeg"
  );
  if (!thumbData) throw new Error("Thumbnail upload failed");

  // Insert into the database
  const { error: insertError } = await supabase.from("lab_reports").insert({
    user_id: userId,
    file_path: fileData.path,
    file_name: uniqueFileName,
    doc_preview_url: thumbData.path,
    extraction_status: "pending",
    uploaded_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error("Insertion error:", insertError);
    throw insertError;
  }
}
