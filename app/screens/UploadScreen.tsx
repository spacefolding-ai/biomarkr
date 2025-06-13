import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Camera from 'expo-camera';
import Toast from 'react-native-toast-message';
import { uploadFile } from '../services/upload';

export default function UploadScreen() {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setFileUri(result.assets[0].uri);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
    });

    if (result.assets && result.assets.length > 0) {
      setFileUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setFileUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!fileUri) return;

    try {
      setUploading(true);
      await uploadFile(fileUri);
      Toast.show({ type: 'success', text1: 'Success', text2: 'File uploaded successfully' });
      setFileUri(null);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Upload failed', text2: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick Image from Gallery" onPress={pickImage} />
      <View style={styles.spacer} />
      <Button title="Pick Document (PDF, Image)" onPress={pickDocument} />
      <View style={styles.spacer} />
      <Button title="Take Photo (Camera)" onPress={takePhoto} />
      <View style={styles.spacer} />

      {fileUri && (
        <>
          {fileUri.endsWith('.pdf') ? (
            <Text>PDF selected: {fileUri.split('/').pop()}</Text>
          ) : (
            <Image source={{ uri: fileUri }} style={styles.imagePreview} />
          )}
          <Button title="Upload to Supabase" onPress={handleUpload} />
        </>
      )}

      {uploading && (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  spacer: { marginVertical: 10 },
  imagePreview: { width: 200, height: 200, marginVertical: 10 },
});