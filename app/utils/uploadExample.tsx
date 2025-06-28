import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { UploadActions } from "../components/UploadActions";
import { useDuplicateFileCheck } from "../hooks/useDuplicateFileCheck";
import { useAuthStore } from "../store/useAuthStore";

// Example component showing how to use duplicate file detection
export const UploadScreenExample: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
  } | null>(null);
  const { user } = useAuthStore();

  const {
    isUploading,
    isCheckingDuplicate,
    uploadWithDuplicateCheck,
    checkDuplicate,
  } = useDuplicateFileCheck({
    userId: user?.id || "",
    onUploadSuccess: (data) => {
      console.log("Upload successful:", data);
      setSelectedFile(null);
      // Navigate to next screen or update UI
    },
    onUploadError: (error) => {
      console.error("Upload failed:", error);
      // Handle error - maybe show retry option
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadWithDuplicateCheck(selectedFile.uri, selectedFile.name);
    } catch (error) {
      // Error is already handled by the hook
      console.log("Upload process completed with error:", error);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
  };

  // Example function to check for duplicate before showing upload options
  const handleFileSelected = async (fileUri: string, fileName: string) => {
    setSelectedFile({ uri: fileUri, name: fileName });

    // Optional: Check for duplicate immediately when file is selected
    // const { isDuplicate, existingFile } = await checkDuplicate(fileUri);
    // if (isDuplicate) {
    //   // Show warning badge or different UI
    // }
  };

  return (
    <View style={styles.container}>
      {selectedFile && (
        <>
          <Text style={styles.filename}>Selected: {selectedFile.name}</Text>

          {isCheckingDuplicate && (
            <Text style={styles.checkingText}>Checking for duplicates...</Text>
          )}

          <UploadActions
            onUpload={handleUpload}
            onCancel={handleCancel}
            uploading={isUploading}
            checkForDuplicate={() => checkDuplicate(selectedFile.uri)}
            fileUri={selectedFile.uri}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filename: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  checkingText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 8,
  },
});

// Example of direct usage without the component
export const directUploadExample = async (
  fileUri: string,
  fileName: string,
  userId: string
) => {
  const { uploadWithDuplicateCheck } = useDuplicateFileCheck({
    userId,
    onUploadSuccess: (data) => console.log("Success:", data),
    onUploadError: (error) => console.error("Error:", error),
  });

  try {
    const result = await uploadWithDuplicateCheck(fileUri, fileName);
    return result;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};
