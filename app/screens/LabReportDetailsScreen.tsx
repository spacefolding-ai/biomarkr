import React, { useEffect, useRef, useState } from "react";
import { Button, Dimensions, StyleSheet, View } from "react-native";
import { SceneMap, TabView } from "react-native-tab-view";
import { AddBiomarkerModal } from "../components/AddBiomarkerModal";
import { BiomarkerEditModal } from "../components/BiomarkerEditModal";
import { BiomarkersTab } from "../components/BiomarkersTab";
import { DatePickerModal } from "../components/DatePickerModal";
import { DocumentsTab } from "../components/DocumentsTab";
import { EditModal } from "../components/EditModal";
import { ProfileSection } from "../components/ProfileSection";
import { useLabReportEditor } from "../hooks/useLabReportEditor";
import {
  createBiomarkerInDb,
  deleteBiomarkerFromDb,
} from "../services/biomarkers";
import { useAuthStore } from "../store/useAuthStore";
import { useBiomarkersStore } from "../store/useBiomarkersStore";
import { Biomarker } from "../types/Biomarker";
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
  const { user } = useAuthStore();
  const { biomarkers, setBiomarkers, updateBiomarker, addBiomarker } =
    useBiomarkersStore();
  const relatedBiomarkers = getRelatedBiomarkers(biomarkers, labReport.id);

  const [index, setIndex] = useState(0);
  const [routes] = useState(createTabRoutes());
  const lastHasChangesRef = useRef<boolean>(false);

  // Local state to track deleted biomarker IDs
  const [deletedBiomarkerIds, setDeletedBiomarkerIds] = useState<string[]>([]);

  // Biomarker editing state
  const [selectedBiomarker, setSelectedBiomarker] = useState<Biomarker | null>(
    null
  );
  const [isBiomarkerEditModalVisible, setIsBiomarkerEditModalVisible] =
    useState(false);
  const [modifiedBiomarkers, setModifiedBiomarkers] = useState<Biomarker[]>([]);

  // Add biomarker modal state
  const [isAddBiomarkerModalVisible, setIsAddBiomarkerModalVisible] =
    useState(false);
  const [newBiomarkers, setNewBiomarkers] = useState<Biomarker[]>([]);

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
  }, [
    date,
    laboratory,
    notes,
    deletedBiomarkerIds,
    modifiedBiomarkers,
    newBiomarkers,
    navigation,
  ]);

  // Check if there are changes including deleted, modified, and new biomarkers
  const hasChangesWithBiomarkers = () => {
    return (
      hasChanges() ||
      deletedBiomarkerIds.length > 0 ||
      modifiedBiomarkers.length > 0 ||
      newBiomarkers.length > 0
    );
  };

  // Handle biomarker deletion (local state only)
  const handleDeleteBiomarker = (biomarkerId: string) => {
    // Check if it's a new biomarker (not yet saved to DB)
    const isNewBiomarker = newBiomarkers.some((b) => b.id === biomarkerId);

    if (isNewBiomarker) {
      // Remove from new biomarkers list
      setNewBiomarkers((prev) => prev.filter((b) => b.id !== biomarkerId));
    } else {
      // Add to deleted list for existing biomarkers
      setDeletedBiomarkerIds((prev) => [...prev, biomarkerId]);
    }

    // Clear selection if deleted biomarker was selected
    if (selectedBiomarker?.id === biomarkerId) {
      setSelectedBiomarker(null);
    }
  };

  // Handle biomarker editing
  const handleEditBiomarker = (biomarker: Biomarker) => {
    setSelectedBiomarker(biomarker);
    setIsBiomarkerEditModalVisible(true);
  };

  // Handle biomarker save from edit modal
  const handleSaveBiomarker = (updatedBiomarker: Biomarker) => {
    // Check if it's a new biomarker
    const isNewBiomarker = newBiomarkers.some(
      (b) => b.id === updatedBiomarker.id
    );

    if (isNewBiomarker) {
      // Update in new biomarkers list
      setNewBiomarkers((prev) =>
        prev.map((b) => (b.id === updatedBiomarker.id ? updatedBiomarker : b))
      );
    } else {
      // Update local modified biomarkers state for existing biomarkers
      setModifiedBiomarkers((prev) => {
        const existingIndex = prev.findIndex(
          (b) => b.id === updatedBiomarker.id
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = updatedBiomarker;
          return updated;
        } else {
          return [...prev, updatedBiomarker];
        }
      });
    }

    setSelectedBiomarker(null);
  };

  // Handle adding new biomarker
  const handleAddBiomarker = (newBiomarkerData: {
    marker_name: string;
    value: string;
    unit: string;
  }) => {
    if (!user?.id) return;

    // Create a temporary biomarker object for local display
    const tempBiomarker: Biomarker = {
      id: `temp_${Date.now()}`, // Temporary ID
      report_id: labReport.id,
      user_id: user.id,
      marker_name: newBiomarkerData.marker_name,
      value: parseFloat(newBiomarkerData.value) || 0,
      unit: newBiomarkerData.unit,
      reference_range: "",
      abnormal_flag: null,
      created_at: new Date().toISOString(),
      report_date: labReport.report_date,
      biomarker_group: undefined,
    };

    setNewBiomarkers((prev) => [...prev, tempBiomarker]);
  };

  // Handle opening add biomarker modal
  const handleOpenAddBiomarkerModal = () => {
    setIsAddBiomarkerModalVisible(true);
  };

  // Handle save with biomarker deletions, modifications, and new additions
  const handleSaveWithBiomarkers = async () => {
    try {
      // First save the lab report changes
      await handleSave();

      // Then permanently delete biomarkers from Supabase
      for (const biomarkerId of deletedBiomarkerIds) {
        await deleteBiomarkerFromDb(biomarkerId);
      }

      // Update modified biomarkers
      for (const modifiedBiomarker of modifiedBiomarkers) {
        await updateBiomarker(modifiedBiomarker);
      }

      // Create new biomarkers
      for (const newBiomarker of newBiomarkers) {
        const createdBiomarker = await createBiomarkerInDb({
          marker_name: newBiomarker.marker_name,
          value: newBiomarker.value,
          unit: newBiomarker.unit,
          report_id: labReport.id,
          user_id: user?.id || "",
          report_date: labReport.report_date,
        });

        // Add to the global biomarkers store
        addBiomarker(createdBiomarker);
      }

      // Remove deleted biomarkers from local store after all operations are complete
      if (deletedBiomarkerIds.length > 0) {
        const updatedBiomarkers = biomarkers.filter(
          (b) => !deletedBiomarkerIds.includes(b.id)
        );
        setBiomarkers(updatedBiomarkers);
      }

      // Clear local state after successful save
      setDeletedBiomarkerIds([]);
      setModifiedBiomarkers([]);
      setNewBiomarkers([]);
      setSelectedBiomarker(null);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  // Handle revert with biomarker restoration
  const handleRevertWithBiomarkers = () => {
    revertChanges();
    setDeletedBiomarkerIds([]);
    setModifiedBiomarkers([]);
    setNewBiomarkers([]);
    setSelectedBiomarker(null);
  };

  // Filter biomarkers to exclude locally deleted ones, apply local modifications, and include new ones
  const displayedBiomarkers = [
    // Existing biomarkers (filtered and modified)
    ...relatedBiomarkers
      .filter((biomarker) => !deletedBiomarkerIds.includes(biomarker.id))
      .map((biomarker) => {
        const modifiedVersion = modifiedBiomarkers.find(
          (m) => m.id === biomarker.id
        );
        return modifiedVersion || biomarker;
      }),
    // New biomarkers
    ...newBiomarkers,
  ];

  const renderScene = SceneMap({
    results: () => (
      <BiomarkersTab
        biomarkers={displayedBiomarkers}
        isEditMode={isEditMode}
        selectedBiomarkerId={selectedBiomarker?.id || null}
        onDeleteBiomarker={handleDeleteBiomarker}
        onEditBiomarker={handleEditBiomarker}
        onAddBiomarker={isEditMode ? handleOpenAddBiomarkerModal : undefined}
        navigation={navigation}
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

      <BiomarkerEditModal
        isVisible={isBiomarkerEditModalVisible}
        biomarker={selectedBiomarker}
        onClose={() => setIsBiomarkerEditModalVisible(false)}
        onSave={handleSaveBiomarker}
      />

      <AddBiomarkerModal
        isVisible={isAddBiomarkerModalVisible}
        onClose={() => setIsAddBiomarkerModalVisible(false)}
        onSave={handleAddBiomarker}
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
