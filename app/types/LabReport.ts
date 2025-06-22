import { ExtractionStatus } from "./ExtractionStatus.enum";

export interface LabReport {
  id: string;
  user_id: string;
  patient_name?: string;
  patient_dob?: string;
  patient_gender?: string;
  laboratory_name?: string;
  report_date?: string;
  description?: string;
  created_at?: string;
  extraction_status?: ExtractionStatus;
  file_name?: string;
  notes?: string;
  doc_preview_url?: string;
}
