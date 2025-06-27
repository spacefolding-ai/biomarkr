import React, { useEffect, useRef, useState } from "react";
import { Button, Dimensions, StyleSheet, View } from "react-native";
import { SceneMap, TabView } from "react-native-tab-view";
import { BiomarkersTab } from "../components/BiomarkersTab";
import { DatePickerModal } from "../components/DatePickerModal";
import { DocumentsTab } from "../components/DocumentsTab";
import { EditModal } from "../components/EditModal";
import { ProfileSection } from "../components/ProfileSection";
import { useLabReportEditor } from "../hooks/useLabReportEditor";
import { deleteBiomarkerFromDb } from "../services/biomarkers";
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
      shouldSave?: boolean;
      shouldRevert?: boolean;
      hasChanges?: boolean;
    };
  };
  navigation: any;
}

const LabReportDetailsScreen: React.FC<LabReportDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { labReport, isEditMode, shouldSave, shouldRevert } = route.params;
  const { biomarkers, setBiomarkers } = useBiomarkersStore();
  const relatedBiomarkers = getRelatedBiomarkers(biomarkers, labReport.id);

  const [index, setIndex] = useState(0);
  const [routes] = useState(createTabRoutes());
  const lastHasChangesRef = useRef<boolean>(false);

  // Local state to track deleted biomarker IDs
  const [deletedBiomarkerIds, setDeletedBiomarkerIds] = useState<string[]>([]);

  const {
    date,
    laboratory,
    notes,
    isSaving,
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
    revertChanges,
    hasChanges,
  } = useLabReportEditor(labReport);

  // Handle navigation parameters for save/revert actions
  useEffect(() => {
    if (shouldSave) {
      handleSaveWithBiomarkers();
      // Clear the parameter to avoid re-triggering
      route.params.shouldSave = false;
    } else if (shouldRevert) {
      handleRevertWithBiomarkers();
      // Clear the parameter to avoid re-triggering
      route.params.shouldRevert = false;
    }
  }, [shouldSave, shouldRevert, route.params]);

  // Update navigation params with hasChanges boolean value only when it actually changes
  useEffect(() => {
    const currentHasChanges = hasChangesWithBiomarkers();
    if (currentHasChanges !== lastHasChangesRef.current) {
      lastHasChangesRef.current = currentHasChanges;
      navigation.setParams({ hasChanges: currentHasChanges });
    }
  }, [date, laboratory, notes, deletedBiomarkerIds, navigation]);

  // Check if there are changes including deleted biomarkers
  const hasChangesWithBiomarkers = () => {
    return hasChanges() || deletedBiomarkerIds.length > 0;
  };

  // Handle biomarker deletion (local state only)
  const handleDeleteBiomarker = (biomarkerId: string) => {
    setDeletedBiomarkerIds((prev) => [...prev, biomarkerId]);
  };

  // Handle save with biomarker deletions
  const handleSaveWithBiomarkers = async () => {
    try {
      // First save the lab report changes
      await handleSave();

      // Then permanently delete biomarkers from Supabase
      for (const biomarkerId of deletedBiomarkerIds) {
        await deleteBiomarkerFromDb(biomarkerId);
      }

      // Remove deleted biomarkers from local store after all deletions are complete
      if (deletedBiomarkerIds.length > 0) {
        const updatedBiomarkers = biomarkers.filter(
          (b) => !deletedBiomarkerIds.includes(b.id)
        );
        setBiomarkers(updatedBiomarkers);
      }

      // Clear the local deleted list after successful save
      setDeletedBiomarkerIds([]);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  // Handle revert with biomarker restoration
  const handleRevertWithBiomarkers = () => {
    revertChanges();
    setDeletedBiomarkerIds([]);
  };

  // Filter biomarkers to exclude locally deleted ones
  const displayedBiomarkers = relatedBiomarkers.filter(
    (biomarker) => !deletedBiomarkerIds.includes(biomarker.id)
  );

  const renderScene = SceneMap({
    results: () => (
      <BiomarkersTab
        biomarkers={displayedBiomarkers}
        isEditMode={isEditMode}
        onDeleteBiomarker={handleDeleteBiomarker}
      />
    ),
    docs: () => <DocumentsTab />,
  });

  const handleIndexChange = (newIndex: number) => {
    // Disable tab switching when in edit mode
    if (!isEditMode) {
      setIndex(newIndex);
    }
  };

  const renderTabBar = (props: any) => {
    return (
      <View style={[styles.tabBar, isEditMode && styles.tabBarDisabled]}>
        {props.navigationState.routes.map((route: any, i: number) => {
          const isActive = i === props.navigationState.index;
          return (
            <View
              key={route.key}
              style={[
                styles.tabItem,
                isActive && styles.tabItemActive,
                isEditMode && styles.tabItemDisabled,
              ]}
            >
              <Button
                title={route.title}
                onPress={() => !isEditMode && setIndex(i)}
                disabled={isEditMode}
                color={isEditMode ? "#999" : isActive ? "#007AFF" : "#666"}
              />
            </View>
          );
        })}
      </View>
    );
  };

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
        onIndexChange={handleIndexChange}
        initialLayout={{ width: Dimensions.get("window").width }}
        renderTabBar={renderTabBar}
        swipeEnabled={!isEditMode}
      />

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
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabBarDisabled: {
    backgroundColor: "#f5f5f5",
    opacity: 0.6,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabItemDisabled: {
    opacity: 0.5,
  },
});

export default LabReportDetailsScreen;
