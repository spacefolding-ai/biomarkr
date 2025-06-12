import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

type NormalizeResult = {
  uri: string;
  mimeType: string;
};

export const useNormalizeImage = () => {

  const getExtension = (uri: string) => {
    return uri.split('.').pop()?.toLowerCase() || '';
  };

  const getMimeType = (ext: string): string => {
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      case 'heic':
        return 'image/heic';
      case 'heif':
        return 'image/heif';
      default:
        return 'application/octet-stream';
    }
  };

  const normalize = async (uri: string): Promise<NormalizeResult> => {
    const ext = getExtension(uri);
    const mimeType = getMimeType(ext);

    if (mimeType === 'image/heic' || mimeType === 'image/heif') {
      // Convert HEIC/HEIF to PNG
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );

      return { uri: manipResult.uri, mimeType: 'image/png' };
    }

    // If it's already supported, return original file
    return { uri, mimeType };
  };

  return { normalize };
};