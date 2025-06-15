import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabaseClient';
import { uploadFileToStorage } from './storage';

// Simplified mime resolver
function getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf': return 'application/pdf';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    default: return 'application/octet-stream';
  }
}

export async function uploadFileAndInsertToDb(fileUri: string, fileName: string, userId: string) {
  const fileExt = fileName.split('.').pop()?.toLowerCase();
  const mimeType = getMimeType(fileName);
  const uniqueFileName = `${uuidv4()}.${fileExt}`;
  const filePath = `reports/${userId}/${uniqueFileName}`;

  await uploadFileToStorage(fileUri, filePath, mimeType);

  const { error: insertError } = await supabase.from('files').upsert({
    user_id: userId,  // ✅ Always from user.id in session
    file_path: filePath,
    original_file_name: fileName,
    extraction_status: 'pending',
    uploaded_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error('Insertion error:', insertError);
    throw insertError;
  }

  console.log('✅ Upload & Insert Success');
}