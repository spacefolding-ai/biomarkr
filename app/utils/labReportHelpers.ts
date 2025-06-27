import { Biomarker } from "../types/Biomarker";
import { LabReport } from "../types/LabReport";

/**
 * Filters biomarkers that belong to a specific lab report
 */
export const getRelatedBiomarkers = (
  biomarkers: Biomarker[],
  reportId: string
): Biomarker[] => {
  return biomarkers.filter((biomarker) => biomarker.report_id === reportId);
};

/**
 * Formats a date string for display
 */
export const formatDisplayDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Creates tab routes for the tab view
 */
export const createTabRoutes = () => [
  { key: "results", title: "Results" },
  { key: "docs", title: "Docs" },
];

/**
 * Validates if a lab report has required fields for saving
 */
export const validateLabReport = (labReport: Partial<LabReport>): boolean => {
  return !!(labReport.id && labReport.patient_name);
};

/**
 * Gets the display value for a field, with fallback text
 */
export const getDisplayValue = (
  value: string | undefined,
  fallback: string = "Not specified"
): string => {
  return value || fallback;
};
