import { ExtractionStatus } from "./ExtractionStatus.enum";

export interface File {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  thumbnail_url: string;
  uploaded_at: string;
  extraction_status: ExtractionStatus;
  lab_report_id: string | null;
}
