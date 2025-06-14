// Correct imports
import MimeTypes from 'react-native-mime-types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export async function uploadFile(fileUri: string, fileName: string, userId: string) {
  try {
    const response = await fetch(fileUri);
    const fileBlob = await response.blob();

    const fileExt = fileName.split('.').pop()?.toLowerCase();
    const mimeType = MimeTypes.lookup(fileName) || 'application/octet-stream';

    const uniqueFileName = `${uuidv4()}.${fileExt}`;
    const filePath = `reports/${userId}/${uniqueFileName}`;

    const { error } = await supabase.storage
      .from('uploads')
      .upload(filePath, fileBlob, { contentType: mimeType });

    if (error) {
      throw error;
    }

    // Insert file details into the 'files' table
    const { data, error: insertError } = await supabase.from('files').insert({
      user_id: userId,
      file_path: filePath,
      original_file_name: fileName,
      extraction_status: 'pending',
      uploaded_at: new Date().toISOString(),
    });

    console.log('Insertion response:', data);
    if (insertError) {
      console.error('Insertion error:', insertError);
      throw insertError;
    }

    return filePath;
  } catch (err) {
    console.error('Upload failed:', err);
    throw err;
  }
} 