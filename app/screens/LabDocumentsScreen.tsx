import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const LabDocumentsScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {[...Array(10)].map((_, index) => (
        <View key={index} style={styles.itemContainer}>
          <FontAwesome
            name="file-image-o"
            size={50}
            color="#0000FF"
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.reportDate}>Report Date</Text>
            <Text style={styles.description}>Description</Text>
            <Text style={styles.status}>Extraction Status</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  reportDate: {
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    fontSize: 18,
    color: "#555",
    fontWeight: "bold",
  },
  status: {
    fontSize: 14,
    color: "#007BFF",
  },
});

export default LabDocumentsScreen;
