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
import { Biomarker } from "../types/Biomarker";

interface BiomarkerEditModalProps {
  isVisible: boolean;
  biomarker: Biomarker | null;
  onClose: () => void;
  onSave: (updatedBiomarker: Biomarker) => void;
}

export const BiomarkerEditModal: React.FC<BiomarkerEditModalProps> = ({
  isVisible,
  biomarker,
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState("");

  // Initialize form when biomarker changes
  React.useEffect(() => {
    if (biomarker) {
      setValue(biomarker.value?.toString() || "");
    }
  }, [biomarker]);

  const handleSave = () => {
    if (!biomarker) return;

    const updatedBiomarker: Biomarker = {
      ...biomarker,
      value: parseFloat(value) || 0,
    };

    onSave(updatedBiomarker);
    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    if (biomarker) {
      setValue(biomarker.value?.toString() || "");
    }
    onClose();
  };

  if (!biomarker) return null;

  const modalContent = (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Edit test</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        {biomarker.marker_name}: {biomarker.value} {biomarker.unit}
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.readOnlyWrapper}>
          <Text style={styles.readOnlyLabel}>{biomarker.marker_name}</Text>
          <TouchableOpacity style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.valueRow}>
          <TextInput
            style={styles.valueInput}
            value={value}
            onChangeText={setValue}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999"
            autoFocus={true}
          />
          <Text style={styles.unitText}>{biomarker.unit}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      style={styles.modal}
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
    height: "60%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  inputContainer: {
    flex: 1,
  },
  readOnlyWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  readOnlyLabel: {
    flex: 1,
    fontSize: 16,
    color: "#666",
  },
  clearButton: {
    padding: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  valueInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  unitText: {
    fontSize: 16,
    color: "#666",
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
});
