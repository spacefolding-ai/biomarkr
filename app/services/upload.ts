import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { formatDateForFilename } from '../utils/date';
import { normalizeImage } from '../utils/file';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import { User } from '../types/user';
import { uploadFileAndInsertToDb } from '../utils/upload';

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

export async function uploadFileToStorage(
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

// Replace existing upload logic with a call to 'uploadFile'
export async function uploadFileToSupabase(fileUri: string, user: User | null): Promise<void> {
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const fileInfo = await normalizeImage(fileUri, user.id);
    await uploadFileAndInsertToDb(fileInfo.normalizedUri, fileInfo.fileName, user.id);
    console.log('File uploaded and inserted into database successfully');
  } catch (error) {
    console.error('Error during file upload:', error);
    throw error;
  }
}

export async function uploadFileFromUriNew(fileUri: string, user: User | null) {
  if (!fileUri) throw new Error('No file selected');

  // Normalize image (convert HEIC/HEIF to PNG if needed)
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