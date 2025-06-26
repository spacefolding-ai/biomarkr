import React from "react";
import { Button, StyleSheet, View } from "react-native";

interface MediaPickerButtonsProps {
  onPickImage: () => void;
  onPickDocument: () => void;
  onTakePhoto: () => void;
  disabled?: boolean;
}

export const MediaPickerButtons: React.FC<MediaPickerButtonsProps> = ({
  onPickImage,
  onPickDocument,
  onTakePhoto,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <Button
        title="Pick Image from Gallery"
        onPress={onPickImage}
        disabled={disabled}
      />
      <View style={styles.spacer} />
      <Button
        title="Pick Document (PDF, Image)"
        onPress={onPickDocument}
        disabled={disabled}
      />
      <View style={styles.spacer} />
      <Button
        title="Take Photo (Camera)"
        onPress={onTakePhoto}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  spacer: {
    marginVertical: 10,
  },
});
