import { supabase } from './supabaseClient';
import { formatDateForFilename } from '../utils/date';
import { normalizeImage } from '../utils/file';

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

export async function uploadFile(fileUri: string) {
  if (!fileUri) throw new Error('No file selected');

  // Normalize image (convert HEIC/HEIF to PNG if needed)
  const { normalizedUri, fileType, fileName } = await normalizeImage(fileUri);

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

  return uploadFileName;
} 