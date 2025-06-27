import { ExtractionStatus } from "./ExtractionStatus.enum";

export interface File {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  thumbnail_path: string;
  uploaded_at: string;
  extraction_status: ExtractionStatus;
  report_id: string | null;
  original_file_name?: string;
  size?: number;
}

export interface SupabaseStorageFile {
  id: string;
  name: string;
  bucket_id: string;
  owner: string | null;
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl?: string;
    eTag?: string;
    httpStatusCode?: number;
  };
}
