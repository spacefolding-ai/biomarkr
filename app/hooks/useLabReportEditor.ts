import { useState } from "react";
import { useLabReportsStore } from "../store/useLabReportsStore";
import { LabReport } from "../types/LabReport";

export const useLabReportEditor = (labReport: LabReport) => {
  const [date, setDate] = useState(
    labReport.report_date || new Date().toISOString()
  );
  const [laboratory, setLaboratory] = useState(labReport.laboratory_name);
  const [notes, setNotes] = useState(labReport.notes);

  // Modal states
  const [isDateModalVisible, setDateModalVisible] = useState(false);
  const [isLabModalVisible, setLabModalVisible] = useState(false);
  const [isNotesModalVisible, setNotesModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { updateReport } = useLabReportsStore();

  // Check if any changes were made
  const hasChanges = () => {
    const originalDate = labReport.report_date || new Date().toISOString();
    return (
      date !== originalDate ||
      laboratory !== labReport.laboratory_name ||
      notes !== labReport.notes
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedReport: LabReport = {
        ...labReport,
        report_date: date,
        laboratory_name: laboratory,
        notes: notes,
      };
      await updateReport(updatedReport);
    } catch (error) {
      // Error handling is done in the store/service layer with Toast
    } finally {
      setIsSaving(false);
    }
  };

  const revertChanges = () => {
    setDate(labReport.report_date || new Date().toISOString());
    setLaboratory(labReport.laboratory_name);
    setNotes(labReport.notes);
  };

  const openDateModal = () => setDateModalVisible(true);
  const closeDateModal = () => setDateModalVisible(false);

  const openLabModal = () => setLabModalVisible(true);
  const closeLabModal = () => setLabModalVisible(false);

  const openNotesModal = () => setNotesModalVisible(true);
  const closeNotesModal = () => setNotesModalVisible(false);

  const handleLabSave = (newValue: string) => {
    setLaboratory(newValue);
    closeLabModal();
  };

  const handleNotesSave = (newValue: string) => {
    setNotes(newValue);
    closeNotesModal();
  };

  return {
    // State
    date,
    laboratory,
    notes,
    isSaving,

    // Modal visibility
    isDateModalVisible,
    isLabModalVisible,
    isNotesModalVisible,

    // Setters
    setDate,
    setLaboratory,
    setNotes,

    // Modal handlers
    openDateModal,
    closeDateModal,
    openLabModal,
    closeLabModal,
    openNotesModal,
    closeNotesModal,

    // Modal save handlers
    handleLabSave,
    handleNotesSave,

    // Actions
    handleSave,
    revertChanges,
    hasChanges,
  };
};
