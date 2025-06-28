import { CryptoDigestAlgorithm, digest } from "expo-crypto";
import * as FileSystem from "expo-file-system";

/**
 * Converts base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts ArrayBuffer to hex string
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates a SHA-256 hash for a file using its content
 * @param fileUri - The URI of the file to hash
 * @returns Promise<string> - SHA-256 hex string hash
 */
export async function getFileContentHash(fileUri: string): Promise<string> {
  try {
    // Read the file as base64
    const base64Content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to Uint8Array for hashing
    const uint8Array = base64ToUint8Array(base64Content);

    // Generate SHA-256 hash
    const hashBuffer = await digest(CryptoDigestAlgorithm.SHA256, uint8Array);

    // Convert ArrayBuffer to hex string
    return arrayBufferToHex(hashBuffer);
  } catch (error) {
    console.error("Error generating file content hash:", error);
    throw new Error("Failed to generate file content hash");
  }
}

/**
 * Alternative method with better error handling
 * @param fileUri - The URI of the file to hash
 * @returns Promise<string> - SHA-256 hex string hash
 */
export async function getFileContentHashSafe(fileUri: string): Promise<string> {
  try {
    // Get file info first to ensure file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }

    // Read file as base64
    const base64Content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert to bytes for hashing
    const uint8Array = base64ToUint8Array(base64Content);

    // Generate hash
    const hashBuffer = await digest(CryptoDigestAlgorithm.SHA256, uint8Array);

    // Convert to hex string
    return arrayBufferToHex(hashBuffer);
  } catch (error) {
    console.error("Error generating file content hash:", error);
    throw new Error("Failed to generate file content hash");
  }
}
