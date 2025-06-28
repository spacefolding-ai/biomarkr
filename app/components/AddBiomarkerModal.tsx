import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ReactNativeModal from "react-native-modal";

interface NewBiomarkerData {
  marker_name: string;
  value: string;
  unit: string;
}

interface AddBiomarkerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (newBiomarkerData: NewBiomarkerData) => void;
}

export const AddBiomarkerModal: React.FC<AddBiomarkerModalProps> = ({
  isVisible,
  onClose,
  onSave,
}) => {
  const [markerName, setMarkerName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");

  const handleSave = () => {
    if (!markerName.trim() || !value.trim() || !unit.trim()) {
      return; // Don't save if any field is empty
    }

    const newBiomarkerData: NewBiomarkerData = {
      marker_name: markerName.trim(),
      value: value.trim(),
      unit: unit.trim(),
    };

    onSave(newBiomarkerData);
    handleClose();
  };

  const handleClose = () => {
    // Reset form on close
    setMarkerName("");
    setValue("");
    setUnit("");
    onClose();
  };

  const isFormValid = markerName.trim() && value.trim() && unit.trim();

  const modalContent = (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Add Biomarker</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.nameInput}
            value={markerName}
            onChangeText={setMarkerName}
            placeholder="Write biomarker name..."
            placeholderTextColor="#999"
            autoFocus={true}
          />
        </View>

        <View style={styles.valueUnitsRow}>
          <View style={styles.valueWrapper}>
            <TextInput
              style={styles.valueInput}
              value={value}
              onChangeText={setValue}
              placeholder="Value"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.unitsWrapper}>
            <TextInput
              style={styles.unitsInput}
              value={unit}
              onChangeText={setUnit}
              placeholder="Units"
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.saveButton,
                !isFormValid && styles.saveButtonDisabled,
              ]}
              disabled={!isFormValid}
            >
              <Ionicons name="checkmark" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      style={styles.modal}
      avoidKeyboard={true}
      {...({} as any)}
    >
      {modalContent}
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: "50%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    flex: 1,
  },
  inputWrapper: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  nameInput: {
    fontSize: 16,
    color: "#000",
  },
  valueUnitsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  valueWrapper: {
    flex: 1,
    marginRight: 12,
  },
  valueInput: {
    fontSize: 16,
    color: "#000",
  },
  unitsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  unitsInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
});
