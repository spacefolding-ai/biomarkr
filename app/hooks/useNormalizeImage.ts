import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export function useNormalizeImage() {
  return async (asset: any) => {
    const fileUri = asset.uri;
    let fileName = asset.fileName || 'upload.png';
    const extension = fileName.split('.').pop()?.toLowerCase();

    let normalizedUri = fileUri;
    let fileType = asset.type || 'image/png';

    // Only convert if HEIC or HEIF
    if (extension === 'heic' || extension === 'heif') {
      const manipulated = await ImageManipulator.manipulateAsync(fileUri, [], {
        format: ImageManipulator.SaveFormat.PNG,
      });
      normalizedUri = manipulated.uri;
      fileType = 'image/png';
      fileName = fileName.replace(/\.(heic|heif)$/i, '.png');
    }

    return { normalizedUri, fileName, fileType };
  };
}