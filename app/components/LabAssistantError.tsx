import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LabAssistantErrorProps {
  error: string;
  onRetry: () => void;
}

export const LabAssistantError: React.FC<LabAssistantErrorProps> = ({
  error,
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lab Assistant Unavailable</Text>
      <Text style={styles.message}>{error}</Text>

      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>

      <View style={styles.troubleshootContainer}>
        <Text style={styles.troubleshootTitle}>To Fix This Issue:</Text>
        <Text style={styles.troubleshootStep}>1. Go to your n8n dashboard</Text>
        <Text style={styles.troubleshootStep}>
          2. Find the Lab Assistant workflow
        </Text>
        <Text style={styles.troubleshootStep}>
          3. Click the toggle switch to activate it
        </Text>
        <Text style={styles.troubleshootStep}>
          4. Ensure the workflow is "Active"
        </Text>
        <Text style={styles.troubleshootStep}>
          5. Return here and tap "Retry"
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  troubleshootContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  troubleshootTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  troubleshootStep: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
});
