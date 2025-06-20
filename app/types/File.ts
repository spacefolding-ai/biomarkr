import { ExtractionStatus } from "./ExtractionStatus.enum";

export interface File {
  id: string;
  user_id: string;
  file_path: string;
  original_file_name: string;
  uploaded_at: string;
  lab_report_id: string | null;
  extraction_status: ExtractionStatus;
}
