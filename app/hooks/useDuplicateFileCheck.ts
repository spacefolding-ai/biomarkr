import { useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import {
  checkForDuplicateFile,
  DuplicateFileError,
  uploadFileAndInsertToDb,
} from "../services/upload";

interface UseDuplicateFileCheckProps {
  userId: string;
  onUploadSuccess?: (data: any) => void;
  onUploadError?: (error: Error) => void;
}

export function useDuplicateFileCheck({
  userId,
  onUploadSuccess,
  onUploadError,
}: UseDuplicateFileCheckProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  /**
   * Check if a file is a duplicate
   */
  const checkDuplicate = async (fileUri: string) => {
    setIsCheckingDuplicate(true);
    try {
      const result = await checkForDuplicateFile(fileUri, userId);
      return result;
    } catch (error) {
      console.error("Error checking for duplicate:", error);
      return { isDuplicate: false };
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  /**
   * Upload file with automatic duplicate detection
   */
  const uploadWithDuplicateCheck = async (
    fileUri: string,
    fileName: string,
    skipDuplicateCheck = false
  ) => {
    setIsUploading(true);

    try {
      // Check for duplicates first (unless skipped)
      if (!skipDuplicateCheck) {
        const { isDuplicate, existingFile } = await checkDuplicate(fileUri);

        if (isDuplicate) {
          setIsUploading(false);
          return new Promise<void>((resolve, reject) => {
            Alert.alert(
              "Duplicate File Detected",
              `This file has already been uploaded as "${
                existingFile?.original_file_name
              }" on ${new Date(
                existingFile?.uploaded_at
              ).toLocaleDateString()}.\n\nWould you like to upload it anyway?`,
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => {
                    reject(new Error("Upload cancelled by user"));
                  },
                },
                {
                  text: "Upload Anyway",
                  style: "default",
                  onPress: async () => {
                    try {
                      // Retry upload without duplicate check
                      await uploadWithDuplicateCheck(fileUri, fileName, true);
                      resolve();
                    } catch (error) {
                      reject(error);
                    }
                  },
                },
              ]
            );
          });
        }
      }

      // Proceed with upload
      const result = await uploadFileAndInsertToDb(fileUri, fileName, userId);

      Toast.show({
        type: "success",
        text1: "Upload Successful",
        text2: "Your file has been uploaded successfully.",
      });

      onUploadSuccess?.(result);
      return result;
    } catch (error) {
      console.error("Upload error:", error);

      if (error instanceof DuplicateFileError) {
        Toast.show({
          type: "error",
          text1: "Duplicate File",
          text2: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
        });
      }

      onUploadError?.(
        error instanceof Error ? error : new Error("Upload failed")
      );
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Upload file without duplicate checking (force upload)
   */
  const forceUpload = async (fileUri: string, fileName: string) => {
    return uploadWithDuplicateCheck(fileUri, fileName, true);
  };

  return {
    isUploading,
    isCheckingDuplicate,
    checkDuplicate,
    uploadWithDuplicateCheck,
    forceUpload,
  };
}
