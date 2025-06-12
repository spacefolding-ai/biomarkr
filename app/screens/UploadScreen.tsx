import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Camera from 'expo-camera';
import { supabase } from '../services/supabaseClient';

export default function UploadScreen() {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
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

  const uploadFile = async () => {
    if (!fileUri) return;

    try {
      setUploading(true);

      const response = await fetch(fileUri);
      const blob = await response.blob();

      const fileName = `${Date.now()}-${fileUri.split('/').pop()}`;

      const { error } = await supabase.storage
        .from('reports') // <-- your Supabase bucket name
        .upload(fileName, blob, {
          contentType: blob.type || 'application/octet-stream',
        });

      if (error) throw error;

      Alert.alert('Success', 'File uploaded successfully');
      setFileUri(null);
    } catch (error: any) {
      Alert.alert('Upload failed', error.message);
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
          <Button title="Upload to Supabase" onPress={uploadFile} />
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