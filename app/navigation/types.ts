export type RootStackParamList = {
  Auth: { screen: "Login" } | undefined;
  Main: undefined;
  More: undefined;
  Login: undefined;
  HealthLab: { screen: "Biomarkers" | "LabReports" } | undefined; // Define nested screens
  // Add other screens here as needed
};
