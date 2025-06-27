import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { RootStackParamList } from "../navigation/types";
import { uploadFileAndInsertToDb } from "../services/upload";
import { FileInfo } from "../utils/file";

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const uploadFile = async (fileInfo: FileInfo, userId: string) => {
    if (!fileInfo || !userId) {
      return;
    }

    try {
      setUploading(true);
      await uploadFileAndInsertToDb(
        fileInfo.normalizedUri,
        fileInfo.fileName,
        userId
      );

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
