import React, { useState } from "react";
import {
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
  const { labReport, isEditMode } = route.params;
  const { biomarkers } = useBiomarkersStore();
  const relatedBiomarkers = biomarkers.filter(
    (b) => b.report_id === labReport.id
  );
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "results", title: "Results" },
    { key: "docs", title: "Docs" },
  ]);

  const [date, setDate] = useState(labReport.report_date);
  const [laboratory, setLaboratory] = useState(labReport.laboratory_name);
  const [notes, setNotes] = useState(labReport.notes);

  const handleSave = () => {
    // Update the store with new values
    // Call update function from the store
  };

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
              {biomarker.abnormal_flag?.toLowerCase() === "high" ? (
                <Text style={styles.abnormalHigh}>▲</Text>
              ) : biomarker.abnormal_flag?.toLowerCase() === "low" ? (
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
          <View style={styles.detailRow}>
            <Text style={styles.profileText}>Profile</Text>
            <Text style={styles.profileValue}>{labReport.patient_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.profileText}>Date</Text>
            {isEditMode ? (
              <Button
                title={date || "Set Date"}
                onPress={() => {
                  /* Open date picker */
                }}
              />
            ) : (
              <Text style={styles.profileValue}>{date}</Text>
            )}
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.profileText}>Date of Birth</Text>
            <Text style={styles.profileValue}>
              {labReport.patient_dob || "Not specified"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.profileText}>Patient Gender</Text>
            <Text style={styles.profileValue}>
              {labReport.patient_gender || "Not specified"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.profileText}>Laboratory</Text>
            {isEditMode ? (
              <TextInput
                style={styles.input}
                value={laboratory}
                onChangeText={setLaboratory}
                placeholder="Enter Laboratory"
              />
            ) : (
              <Text style={styles.profileValue}>
                {laboratory || "Not specified"}
              </Text>
            )}
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.profileText}>Notes</Text>
            {isEditMode ? (
              <TextInput
                style={styles.input}
                value={notes}
                onChangeText={setNotes}
                placeholder="Enter Notes"
              />
            ) : (
              <Text style={styles.profileValue}>
                {notes || "Not specified"}
              </Text>
            )}
          </View>
        </View>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
      />
      {isEditMode && <Button title="Save" onPress={handleSave} />}
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 16,
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
    color: "#333",
    fontWeight: "bold",
  },
  profileValue: {
    fontSize: 16,
    fontWeight: "normal",
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
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 4,
    paddingTop: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 4,
    fontSize: 16,
  },
});

export default LabReportDetailsScreen;
