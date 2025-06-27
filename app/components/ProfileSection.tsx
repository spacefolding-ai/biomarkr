import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LabReport } from "../types/LabReport";

interface ProfileSectionProps {
  labReport: LabReport;
  date: string;
  laboratory: string | undefined;
  notes: string | undefined;
  isEditMode: boolean;
  onDatePress: () => void;
  onLaboratoryPress: () => void;
  onNotesPress: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  labReport,
  date,
  laboratory,
  notes,
  isEditMode,
  onDatePress,
  onLaboratoryPress,
  onNotesPress,
}) => {
  return (
    <View style={styles.profileContainer}>
      <View style={styles.avatar} />
      <View style={styles.profileDetails}>
        <ProfileRow label="Profile" value={labReport.patient_name} />
        <ProfileRow
          label="Date"
          value={new Date(date).toLocaleDateString()}
          isEditable={isEditMode}
          onPress={onDatePress}
        />
        <ProfileRow
          label="Date of Birth"
          value={labReport.patient_dob || "Not specified"}
        />
        <ProfileRow
          label="Patient Gender"
          value={labReport.patient_gender || "Not specified"}
        />
        <ProfileRow
          label="Laboratory"
          value={laboratory || "Not specified"}
          isEditable={isEditMode}
          onPress={onLaboratoryPress}
          placeholder="Set Laboratory"
        />
        <ProfileRow
          label="Notes"
          value={notes || "Not specified"}
          isEditable={isEditMode}
          onPress={onNotesPress}
          placeholder="Add Notes"
        />
      </View>
    </View>
  );
};

interface ProfileRowProps {
  label: string;
  value: string;
  isEditable?: boolean;
  onPress?: () => void;
  placeholder?: string;
}

const ProfileRow: React.FC<ProfileRowProps> = ({
  label,
  value,
  isEditable = false,
  onPress,
  placeholder,
}) => {
  const displayValue =
    value === "Not specified" && placeholder ? placeholder : value;

  return (
    <View style={styles.detailRow}>
      <Text style={styles.profileText}>{label}</Text>
      {isEditable && onPress ? (
        <Pressable onPress={onPress}>
          <Text style={[styles.profileValue, styles.editableValue]}>
            {displayValue}
          </Text>
        </Pressable>
      ) : (
        <Text style={styles.profileValue}>{value}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  profileDetails: {
    flex: 1,
    justifyContent: "center",
  },
  profileText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  profileValue: {
    fontSize: 16,
    fontWeight: "normal",
    marginBottom: 8,
  },
  editableValue: {
    color: "orange",
  },
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
});
