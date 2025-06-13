import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Camera from 'expo-camera';
import { supabase } from '../services/supabaseClient';
import Toast from 'react-native-toast-message';
import { useNormalizeImage } from '../hooks/useNormalizeImage';
import * as FileSystem from 'expo-file-system';
import { Base64 } from 'js-base64';

export default function UploadScreen() {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();
  const normalizeImage = useNormalizeImage();

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

  // Helper to format date for filename
  function formatDateForFilename(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  }

  // Helper to get server time from Supabase
  async function getServerTime() {
    const { data, error } = await supabase.rpc('now');
    if (error || !data) return new Date();
    return new Date(data);
  }

  // Helper to get user's full name from Supabase
  async function getUserFullName() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return 'upload';
    const { data: userProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('auth_user_id', userId)
      .single();
    return userProfile?.full_name || 'upload';
  }

  const uploadFile = async () => {
    if (!fileUri) return;

    try {
      setUploading(true);

      // Normalize image (convert HEIC/HEIF to PNG if needed)
      const { normalizedUri, fileType, fileName } = await normalizeImage({ uri: fileUri });

      // Get server time and user full name
      const [serverTime, fullName] = await Promise.all([
        getServerTime(),
        getUserFullName(),
      ]);
      const safeName = fullName.replace(/\s+/g, '_');
      const dateStr = formatDateForFilename(serverTime);
      const ext = fileName.split('.').pop();
      const uploadFileName = `${dateStr}_${safeName}.${ext}`;

      // Prepare form data
      const formData = new FormData();
      formData.append('file', {
        uri: normalizedUri,
        type: fileType,
        name: uploadFileName,
      } as any);

      // Do NOT set Content-Type header manually!
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/reports/${uploadFileName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

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