import * as MediaLibrary from "expo-media-library";

/**
 * Attempts to get the actual filename from various sources
 * @param uri - The file URI
 * @param fallbackName - Fallback name if actual filename cannot be determined
 * @param mediaLibraryPermission - MediaLibrary permission status
 * @returns Promise<string> - The resolved filename
 */
export const getActualFilename = async (
  uri: string,
  fallbackName: string,
  mediaLibraryPermission?: MediaLibrary.PermissionResponse | null
): Promise<string> => {
  try {
    if (mediaLibraryPermission?.granted) {
      // Try to get asset info from MediaLibrary
      const asset = await MediaLibrary.getAssetInfoAsync(uri);
      if (asset && asset.filename) {
        return asset.filename;
      }
    }
  } catch (error) {
    // MediaLibrary failed
  }

  // Fallback 1: Try to extract meaningful name from URI path
  try {
    const uriParts = uri.split("/");
    const lastPart = uriParts[uriParts.length - 1];

    // Remove query parameters if any
    const filenamePart = lastPart.split("?")[0];

    // Check if it looks like a real filename (contains letters, not just UUID pattern)
    if (
      filenamePart &&
      filenamePart.includes(".") &&
      !filenamePart.match(/^[A-F0-9-]{8,}\.(jpg|jpeg|png|pdf)$/i) &&
      filenamePart.length > 5
    ) {
      return filenamePart;
    }
  } catch (error) {
    // Failed to extract filename from URI
  }

  // Fallback 2: Use the provided fallback name
  return fallbackName;
};

/**
 * Generates a timestamp-based filename for camera photos
 * @param extension - File extension (default: 'jpg')
 * @returns string - Timestamp-based filename
 */
export const generateTimestampFilename = (
  extension: string = "jpg"
): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `photo_${timestamp}.${extension}`;
};

/**
 * Generates a fallback filename with timestamp
 * @param prefix - Filename prefix
 * @param extension - File extension
 * @returns string - Generated filename
 */
export const generateFallbackFilename = (
  prefix: string,
  extension: string
): string => {
  return `${prefix}_${Date.now()}.${extension}`;
};
