import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface LabAssistantLoadingProps {
  message?: string;
}

export const LabAssistantLoading: React.FC<LabAssistantLoadingProps> = ({
  message = "Checking Lab Assistant status...",
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 1,
  },
  text: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
});
