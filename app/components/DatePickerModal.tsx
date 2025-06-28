import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Button, StyleSheet, Text, View, useColorScheme } from "react-native";
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

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const handleDone = () => {
    onDateChange(selectedTempDate.toISOString());
    onClose();
  };

  const handleCancel = () => {
    setSelectedTempDate(new Date(currentDate)); // Reset to original date
    onClose();
  };

  // Dynamic styles based on color scheme
  const dynamicStyles = {
    modalContent: {
      backgroundColor: isDarkMode ? "#1c1c1e" : "white",
    },
    modalHeader: {
      borderColor: isDarkMode ? "#48484a" : "#ccc",
    },
    modalTitle: {
      color: isDarkMode ? "white" : "black",
    },
  };

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={handleCancel}
      style={styles.modal}
      {...({} as any)}
    >
      <View style={[styles.modalContent, dynamicStyles.modalContent]}>
        <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            color={isDarkMode ? "#007AFF" : undefined}
          />
          <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>
            Change Date
          </Text>
          <Button
            title="Done"
            onPress={handleDone}
            color={isDarkMode ? "#007AFF" : undefined}
          />
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
          textColor={isDarkMode ? "white" : "black"}
          themeVariant={isDarkMode ? "dark" : "light"}
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
});
