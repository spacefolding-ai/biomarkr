import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";

interface DatePickerModalProps {
  isVisible: boolean;
  currentDate: string;
  onDateChange: (date: string) => void;
  onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isVisible,
  currentDate,
  onDateChange,
  onClose,
}) => {
  const [selectedTempDate, setSelectedTempDate] = useState<Date>(
    new Date(currentDate)
  );

  const handleDone = () => {
    onDateChange(selectedTempDate.toISOString());
    onClose();
  };

  const handleCancel = () => {
    setSelectedTempDate(new Date(currentDate)); // Reset to original date
    onClose();
  };

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={handleCancel}
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Button title="Cancel" onPress={handleCancel} />
          <Text style={styles.modalTitle}>Change Date</Text>
          <Button title="Done" onPress={handleDone} />
        </View>
        <DateTimePicker
          value={selectedTempDate}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setSelectedTempDate(selectedDate);
            }
          }}
        />
      </View>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    height: "33%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    height: 50,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  modalTitle: {
    color: "black",
    fontSize: 18,
    fontWeight: "500",
  },
});
