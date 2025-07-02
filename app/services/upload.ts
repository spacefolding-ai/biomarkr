import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabase/supabaseClient";
import { ExtractionStatus } from "../types/ExtractionStatus.enum";
import { LabReport } from "../types/LabReport";
import { generatePreview } from "../utils/file";
import { getFileContentHash } from "../utils/getFileContentHash";
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

export class DuplicateFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateFileError";
  }
}

export async function uploadFileAndInsertToDb(
  fileUri: string,
  fileName: string,
  userId: string
) {
  // 1. Generate content hash for duplicate detection
  let contentHash: string;
  try {
    contentHash = await getFileContentHash(fileUri);
  } catch (hashError) {
    console.error("Failed to generate file hash:", hashError);
    throw new Error("Failed to process file for upload");
  }

  // 2. Check if hash already exists for this user
  const { data: existingFile, error: duplicateCheckError } = await supabase
    .from("files")
    .select("id, original_file_name, uploaded_at")
    .eq("content_hash", contentHash)
    .eq("user_id", userId)
    .maybeSingle();

  if (duplicateCheckError) {
    console.error("Error checking for duplicates:", duplicateCheckError);
    throw new Error("Failed to check for duplicate files");
  }

  if (existingFile) {
    throw new DuplicateFileError(
      `This file has already been uploaded as "${
        existingFile.original_file_name
      }" on ${new Date(existingFile.uploaded_at).toLocaleDateString()}.`
    );
  }

  // 3. Create lab_report record first (before file upload to avoid wasting storage if this fails)

  // Generate file info for the lab report
  const fileExt = fileName.split(".").pop()?.toLowerCase();
  const mimeType = getMimeType(fileName);
  const uniqueFileName = `${uuidv4()}.${fileExt}`;
  const filePath = `reports/${userId}/${uniqueFileName}`;

  // Determine thumbnail path immediately
  const thumbnailPath = mimeType.startsWith("image")
    ? `reports/${userId}/thumb_${uniqueFileName}`
    : filePath; // For PDFs and other files, use main file as thumbnail

  const { data: labReportData, error: labReportError } = await supabase
    .from("lab_reports")
    .insert({
      user_id: userId,
      file_name: fileName, // Use original filename for user-friendly display
      file_path: filePath, // Use planned file path
      thumbnail_path: thumbnailPath, // Set thumbnail path immediately
      extraction_status: ExtractionStatus.PENDING,
      // created_at will be handled by Supabase default
      // report_date will be handled by n8n when processing
      // Other fields like patient_name, laboratory_name, etc. will be populated by n8n
    })
    .select("*")
    .single();

  if (labReportError) {
    console.error("Failed to create lab_report:", labReportError);
    throw new Error(
      "Failed to create lab report record: " + labReportError.message
    );
  }

  if (!labReportData) {
    throw new Error("Lab report data is null after insertion");
  }

  // 4. Now proceed with file upload ONLY after lab_report is successfully created

  let fileData;
  let thumbData;

  try {
    // Upload the main file
    fileData = await uploadFileToStorage(fileUri, filePath, mimeType);
    if (!fileData) throw new Error("File upload failed");

    // Generate and upload the thumbnail only for images
    if (mimeType.startsWith("image")) {
      try {
        const previewUri = await generatePreview(fileUri, "image");
        const previewFileName = `thumb_${uniqueFileName}`;
        const previewFilePath = `reports/${userId}/${previewFileName}`;
        thumbData = await uploadFileToStorage(
          previewUri as string,
          previewFilePath,
          "image/jpeg"
        );
      } catch (thumbnailError: any) {
        // If thumbnail fails, use the main file path as fallback
        thumbData = { path: fileData.path };
      }
    } else {
      // For PDFs and other non-image files, use the main file path as thumbnail path
      thumbData = { path: fileData.path };
    }
  } catch (uploadError) {
    console.error(
      "❌ File upload failed after lab_report creation:",
      uploadError
    );

    // Clean up the lab_report record since file upload failed
    try {
      await supabase.from("lab_reports").delete().eq("id", labReportData.id);
    } catch (cleanupError) {
      console.error("❌ Failed to cleanup lab_report:", cleanupError);
    }

    throw new Error("File upload failed: " + uploadError.message);
  }

  // 5. Now insert file into the database with reference to the lab_report
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
      content_hash: contentHash, // Store the hash for future duplicate checks
      report_id: labReportData.id, // Reference to the lab report
    })
    .select("*")
    .single();

  if (insertError) {
    console.error("Failed to create file record:", insertError);
    throw new Error("Failed to create file record: " + insertError.message);
  }

  if (!dataFile) {
    throw new Error("File data is null after insertion");
  }

  return {
    dataFile,
    labReport: labReportData as LabReport,
  };
}

/**
 * Check if a file with the same content hash already exists for the user
 * @param fileUri - The URI of the file to check
 * @param userId - The user ID
 * @returns Promise<boolean> - True if duplicate exists, false otherwise
 */
export async function checkForDuplicateFile(
  fileUri: string,
  userId: string
): Promise<{ isDuplicate: boolean; existingFile?: any }> {
  try {
    const contentHash = await getFileContentHash(fileUri);

    const { data: existingFile, error } = await supabase
      .from("files")
      .select("id, original_file_name, uploaded_at")
      .eq("content_hash", contentHash)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error checking for duplicates:", error);
      return { isDuplicate: false };
    }

    return {
      isDuplicate: !!existingFile,
      existingFile: existingFile || undefined,
    };
  } catch (error) {
    console.error("Error in duplicate check:", error);
    return { isDuplicate: false };
  }
}
