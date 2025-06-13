import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { formatDateForFilename } from '../utils/date';
import { normalizeImage } from '../utils/file';
import { useAuth } from '../hooks/useAuth';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

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

export async function uploadFile(
  uri: string,
  storagePath: string,
  mimeType: string
): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    const fileContent = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { error } = await supabase.storage
      .from('uploads')
      .upload(storagePath, decode(fileContent), {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
}

// Helper function to decode base64 string to Uint8Array
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Legacy function for backward compatibility
export async function uploadFileFromUri(fileUri: string): Promise<void> {
  const user = useAuth.getState().user;
  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  const fileInfo = await normalizeImage(fileUri, user.id);
  return uploadFile(fileInfo.normalizedUri, fileInfo.storagePath, fileInfo.fileType);
}

export async function uploadFileFromUriNew(fileUri: string) {
  if (!fileUri) throw new Error('No file selected');

  // Normalize image (convert HEIC/HEIF to PNG if needed)
  const user = useAuth.getState().user;
  const { normalizedUri, fileType, fileName } = await normalizeImage(fileUri, user?.id);

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
    `${SUPABASE_URL}/storage/v1/object/reports/${uploadFileName}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return uploadFileName;
} 