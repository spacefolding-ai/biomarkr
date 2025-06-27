export interface Biomarker {
  id: string;
  report_id: string;
  user_id: string;
  marker_name: string;
  value: number;
  unit: string;
  reference_range: string;
  abnormal_flag: string | null;
  created_at: string;
  report_date: string;
  biomarker_group?: string;
}
