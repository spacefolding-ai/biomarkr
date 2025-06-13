import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export async function normalizeImage(uri: string) {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    throw new Error('File does not exist');
  }

  const fileName = uri.split('/').pop() || '';
  const fileType = fileName.split('.').pop()?.toLowerCase() || '';

  // If it's a HEIC/HEIF image on iOS, convert it to PNG
  if (Platform.OS === 'ios' && (fileType === 'heic' || fileType === 'heif')) {
    const newUri = uri.replace(/\.(heic|heif)$/i, '.png');
    await FileSystem.copyAsync({
      from: uri,
      to: newUri
    });
    return {
      normalizedUri: newUri,
      fileType: 'image/png',
      fileName: fileName.replace(/\.(heic|heif)$/i, '.png')
    };
  }

  return {
    normalizedUri: uri,
    fileType: `image/${fileType}`,
    fileName
  };
} 