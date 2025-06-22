import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { SceneMap, TabView } from "react-native-tab-view";
import { useBiomarkersStore } from "../store/useBiomarkersStore";
import { LabReport } from "../types/LabReport";

interface LabReportDetailsScreenProps {
  route: {
    params: {
      labReport: LabReport;
    };
  };
}

const LabReportDetailsScreen: React.FC<LabReportDetailsScreenProps> = ({
  route,
}) => {
  const { labReport } = route.params;
  const { biomarkers } = useBiomarkersStore();
  const relatedBiomarkers = biomarkers.filter(
    (b) => b.report_id === labReport.id
  );

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "results", title: "Results" },
    { key: "docs", title: "Docs" },
  ]);

  const renderScene = SceneMap({
    results: () => (
      <ScrollView style={{ padding: 16 }}>
        <Text style={styles.subtitle}>Biomarkers</Text>
        {relatedBiomarkers.map((biomarker) => (
          <View key={biomarker.id} style={styles.biomarkerItem}>
            <Text style={styles.biomarkerName}>{biomarker.marker_name}</Text>
            <View style={styles.biomarkerDetails}>
              <Text style={styles.biomarkerValue}>
                {biomarker.value} {biomarker.unit}
              </Text>
              {biomarker.abnormal_flag === "high" ? (
                <Text style={styles.abnormalHigh}>▲</Text>
              ) : biomarker.abnormal_flag === "low" ? (
                <Text style={styles.abnormalLow}>▼</Text>
              ) : (
                <Text style={styles.normal}>●</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    ),
    docs: () => (
      <View style={{ padding: 16 }}>
        <Text>No documents available.</Text>
      </View>
    ),
  });

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.avatar} />
        <View style={styles.profileDetails}>
          <Text style={styles.profileText}>Profile</Text>
          <Text style={styles.profileValue}>{labReport.patient_name}</Text>
          <Text style={styles.profileText}>Date</Text>
          <Text style={styles.profileValue}>{labReport.report_date}</Text>
          <Text style={styles.profileText}>Laboratory</Text>
          <Text style={styles.profileValue}>
            {labReport.laboratory_name || "Not specified"}
          </Text>
        </View>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileContainer: {
    flexDirection: "row",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
    marginRight: 16,
  },
  profileDetails: {
    flex: 1,
    justifyContent: "center",
  },
  profileText: {
    fontSize: 14,
    color: "#888",
  },
  profileValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  biomarkerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  biomarkerName: {
    fontWeight: "bold",
  },
  biomarkerDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  biomarkerValue: {
    marginRight: 8,
  },
  abnormalHigh: {
    color: "orange",
  },
  abnormalLow: {
    color: "orange",
  },
  normal: {
    color: "green",
  },
});

export default LabReportDetailsScreen;
