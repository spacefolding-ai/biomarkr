import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Button,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { SceneMap, TabView } from "react-native-tab-view";
import { useBiomarkersStore } from "../store/useBiomarkersStore";
import { LabReport } from "../types/LabReport";

interface LabReportDetailsScreenProps {
  route: {
    params: {
      labReport: LabReport;
      isEditMode: boolean;
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

  const [date, setDate] = useState(
    labReport.report_date || new Date().toISOString()
  );
  const [laboratory, setLaboratory] = useState(labReport.laboratory_name);
  const [notes, setNotes] = useState(labReport.notes);

  const [isDateModalVisible, setDateModalVisible] = useState(false);
  const [selectedTempDate, setSelectedTempDate] = useState<Date>(
    new Date(date)
  );
  const [isLabModalVisible, setLabModalVisible] = useState(false);
  const [isNotesModalVisible, setNotesModalVisible] = useState(false);

  const modalContentStyle = {
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    height: "33%",
  };

  const handleSave = () => {
    // Save logic here
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
              <Pressable onPress={() => setDateModalVisible(true)}>
                <Text style={{ ...styles.profileValue, color: "orange" }}>
                  {new Date(date).toLocaleDateString()}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.profileValue}>
                {new Date(date).toLocaleDateString()}
              </Text>
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
              <Pressable onPress={() => setLabModalVisible(true)}>
                <Text style={{ ...styles.profileValue, color: "orange" }}>
                  {laboratory || "Set Laboratory"}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.profileValue}>
                {laboratory || "Not specified"}
              </Text>
            )}
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.profileText}>Notes</Text>
            {isEditMode ? (
              <Pressable onPress={() => setNotesModalVisible(true)}>
                <Text style={{ ...styles.profileValue, color: "orange" }}>
                  {notes || "Add Notes"}
                </Text>
              </Pressable>
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

      {/* Date Modal */}
      <Modal
        isVisible={isDateModalVisible}
        onBackdropPress={() => setDateModalVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View style={modalContentStyle}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              paddingHorizontal: 10,
              height: 50,
            }}
          >
            <Button title="Cancel" onPress={() => setDateModalVisible(false)} />
            <Text style={{ color: "black", fontSize: 18 }}>Change Date</Text>
            <Button
              title="Done"
              onPress={() => {
                setDate(selectedTempDate.toISOString()); // ← update final value here
                setDateModalVisible(false);
              }}
            />
          </View>

          <DateTimePicker
            value={new Date(date)}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setSelectedTempDate(selectedDate); // ← don't update main date yet
              }
            }}
          />
        </View>
      </Modal>

      {/* Laboratory Modal */}
      <Modal
        isVisible={isLabModalVisible}
        onBackdropPress={() => setLabModalVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View style={modalContentStyle}>
          <Text>Enter Laboratory</Text>
          <TextInput
            style={styles.input}
            value={laboratory}
            onChangeText={setLaboratory}
            placeholder="Enter Laboratory"
          />
          <Button title="Close" onPress={() => setLabModalVisible(false)} />
        </View>
      </Modal>

      {/* Notes Modal */}
      <Modal
        isVisible={isNotesModalVisible}
        onBackdropPress={() => setNotesModalVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View style={modalContentStyle}>
          <Text>Enter Notes</Text>
          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter Notes"
          />
          <Button title="Close" onPress={() => setNotesModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  profileDetails: { flex: 1, justifyContent: "center" },
  profileText: { fontSize: 16, color: "#333", fontWeight: "bold" },
  profileValue: { fontSize: 16, fontWeight: "normal", marginBottom: 8 },
  subtitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  biomarkerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  biomarkerName: { fontWeight: "bold" },
  biomarkerDetails: { flexDirection: "row", alignItems: "center" },
  biomarkerValue: { marginRight: 8 },
  abnormalHigh: { color: "orange" },
  abnormalLow: { color: "orange" },
  normal: { color: "green" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 4,
    paddingTop: 4,
    alignItems: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 4,
    fontSize: 16,
    height: 40,
    width: "100%",
  },
});

export default LabReportDetailsScreen;
