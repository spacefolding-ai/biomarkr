import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { RootStackParamList } from "../navigation/types";
import { uploadFileAndInsertToDb } from "../services/upload";
import { useLabReportsStore } from "../store/useLabReportsStore";
import { FileInfo } from "../utils/file";

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { addReport } = useLabReportsStore();

  const uploadFile = async (fileInfo: FileInfo, userId: string) => {
    if (!fileInfo || !userId) {
      return;
    }

    try {
      setUploading(true);

      const { dataFile, labReport } = await uploadFileAndInsertToDb(
        fileInfo.normalizedUri,
        fileInfo.fileName,
        userId
      );

      // Add the lab report to the store immediately
      addReport(labReport);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "File uploaded successfully",
      });

      // Navigate to Lab Reports screen
      navigation.navigate("Health Lab", {
        screen: "Lab Reports",
      });

      return true;
    } catch (error: any) {
      console.error("❌ File upload failed:", error);

      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: error.message,
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadFile,
  };
};
