import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const DocumentsTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>No documents available.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
  },
});
