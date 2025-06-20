export type RootStackParamList = {
  Auth: { screen: "Login" } | undefined;
  Main: undefined;
  More: undefined;
  Login: undefined;
  "Health Lab": { screen: "Biomarkers" | "Lab Reports" } | undefined; // Define nested screens
  // Add other screens here as needed
};
