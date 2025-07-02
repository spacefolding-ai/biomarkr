export interface Biomarker {
  id: string;
  report_id: string;
  user_id: string;
  marker_name: string;
  value: number;
  unit: string;
  reference_range: string;
  optimal_range?: string;
  abnormal_flag: string | null;
  created_at: string;
  report_date: string;
  biomarker_group?: string;
  about?: string;
  what_deviations_mean?: string;
  when_is_test_prescribed?: string;
  standard_values?: string;
  optimal_valuess?: string;
  testing_methods?: string;
  which_specialist_is_needed?: string;
  is_favourite?: boolean;
}
