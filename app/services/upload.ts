import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabase/supabaseClient";
import { ExtractionStatus } from "../types/ExtractionStatus.enum";
import { generatePreview } from "../utils/file";
import { uploadFileToStorage } from "./storage";

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

  console.log(`Starting upload process for: ${fileName}`);

  // Upload the main file
  const fileData = await uploadFileToStorage(fileUri, filePath, mimeType);
  if (!fileData) throw new Error("File upload failed");

  let thumbData;

  // Generate and upload the thumbnail only for images
  if (mimeType.startsWith("image")) {
    try {
      console.log("Generating thumbnail for image...");
      const previewUri = await generatePreview(fileUri, "image");
      const previewFileName = `thumb_${uniqueFileName}`;
      const previewFilePath = `reports/${userId}/${previewFileName}`;
      thumbData = await uploadFileToStorage(
        previewUri as string,
        previewFilePath,
        "image/jpeg"
      );
      console.log("Thumbnail uploaded successfully");
    } catch (thumbnailError: any) {
      console.warn(
        "Thumbnail generation/upload failed:",
        thumbnailError.message
      );
      // If thumbnail fails, use the main file path as fallback
      thumbData = { path: fileData.path };
    }
  } else {
    // For PDFs and other non-image files, use the main file path as thumbnail path
    thumbData = { path: fileData.path };
  }

  console.log("Inserting file record to database...");

  // Insert file into the database
  const { data: dataFile, error: insertError } = await supabase
    .from("files")
    .insert({
      user_id: userId,
      file_path: fileData.path,
      file_name: uniqueFileName,
      original_file_name: fileName,
      thumbnail_path: thumbData.path,
      extraction_status: ExtractionStatus.PENDING,
      uploaded_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (!dataFile) {
    throw new Error("File data is null, cannot insert lab report");
  }

  if (insertError) {
    console.error("Insertion error:", insertError);
    throw insertError;
  }

  console.log(`Upload process completed successfully for: ${fileName}`);
  return { dataFile };
}
