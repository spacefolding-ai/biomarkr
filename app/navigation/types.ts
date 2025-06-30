import { Biomarker } from "../types/Biomarker";
import { LabReport } from "../types/LabReport";

export type RootStackParamList = {
  Auth: { screen: "Login" } | undefined;
  Main: undefined;
  More: undefined;
  Login: undefined;
  "Health Lab": { screen: "Biomarkers" | "Lab Reports" } | undefined;
  LabReportDetails: { labReport: LabReport };
  BiomarkerDetails: { biomarker: Biomarker };
  // Add other screens here as needed
};
