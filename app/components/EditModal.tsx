import React from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import ReactNativeModal from "react-native-modal";

interface EditModalProps {
  isVisible: boolean;
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onSave: () => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
}

export const EditModal: React.FC<EditModalProps> = ({
  isVisible,
  title,
  value,
  onChangeText,
  onClose,
  onSave,
  placeholder = "",
  multiline = false,
  numberOfLines = 1,
  maxLength,
  showCharacterCount = false,
}) => {
  const modalContent = (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Button title="Close" onPress={onClose} />
        <Text style={styles.modalTitle}>{title}</Text>
        <Button title="Save" onPress={onSave} />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          autoFocus={true}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            { height: multiline ? numberOfLines * 25 + 20 : 40 },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
        />
        {showCharacterCount && maxLength && (
          <Text style={styles.characterCount}>
            {value?.length ?? 0}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      children={modalContent}
    />
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
    height: "66%",
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
  inputContainer: {
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    alignItems: "flex-end",
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 4,
    fontSize: 16,
    width: "100%",
  },
  multilineInput: {
    textAlignVertical: "top",
  },
  characterCount: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
});
