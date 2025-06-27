import React, { useState } from "react";
import { Button, Dimensions, StyleSheet, View } from "react-native";
import { SceneMap, TabView } from "react-native-tab-view";
import { BiomarkersTab } from "../components/BiomarkersTab";
import { DatePickerModal } from "../components/DatePickerModal";
import { DocumentsTab } from "../components/DocumentsTab";
import { EditModal } from "../components/EditModal";
import { ProfileSection } from "../components/ProfileSection";
import { useLabReportEditor } from "../hooks/useLabReportEditor";
import { useBiomarkersStore } from "../store/useBiomarkersStore";
import { LabReport } from "../types/LabReport";
import {
  createTabRoutes,
  getRelatedBiomarkers,
} from "../utils/labReportHelpers";

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
  const relatedBiomarkers = getRelatedBiomarkers(biomarkers, labReport.id);

  const [index, setIndex] = useState(0);
  const [routes] = useState(createTabRoutes());

  const {
    date,
    laboratory,
    notes,
    isDateModalVisible,
    isLabModalVisible,
    isNotesModalVisible,
    setDate,
    setLaboratory,
    setNotes,
    openDateModal,
    closeDateModal,
    openLabModal,
    closeLabModal,
    openNotesModal,
    closeNotesModal,
    handleLabSave,
    handleNotesSave,
    handleSave,
  } = useLabReportEditor(labReport);

  const renderScene = SceneMap({
    results: () => <BiomarkersTab biomarkers={relatedBiomarkers} />,
    docs: () => <DocumentsTab />,
  });

  return (
    <View style={styles.container}>
      <ProfileSection
        labReport={labReport}
        date={date}
        laboratory={laboratory}
        notes={notes}
        isEditMode={isEditMode}
        onDatePress={openDateModal}
        onLaboratoryPress={openLabModal}
        onNotesPress={openNotesModal}
      />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
      />

      {isEditMode && <Button title="Save" onPress={handleSave} />}

      <DatePickerModal
        isVisible={isDateModalVisible}
        currentDate={date}
        onDateChange={setDate}
        onClose={closeDateModal}
      />

      <EditModal
        isVisible={isLabModalVisible}
        title="Laboratory Name"
        value={laboratory || ""}
        onChangeText={() => {}} // Not used anymore, handled internally
        onClose={closeLabModal}
        onSave={handleLabSave}
        placeholder="Enter Laboratory"
      />

      <EditModal
        isVisible={isNotesModalVisible}
        title="Enter Notes"
        value={notes || ""}
        onChangeText={() => {}} // Not used anymore, handled internally
        onClose={closeNotesModal}
        onSave={handleNotesSave}
        placeholder="Enter Notes"
        multiline={true}
        numberOfLines={6}
        maxLength={140}
        showCharacterCount={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default LabReportDetailsScreen;
