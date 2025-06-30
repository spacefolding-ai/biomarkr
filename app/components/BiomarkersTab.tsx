import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Biomarker } from "../types/Biomarker";

interface BiomarkersTabProps {
  biomarkers: Biomarker[];
  isEditMode?: boolean;
  selectedBiomarkerId?: string | null;
  onDeleteBiomarker?: (biomarkerId: string) => void;
  onEditBiomarker?: (biomarker: Biomarker) => void;
  onAddBiomarker?: () => void;
  navigation?: any;
}

export const BiomarkersTab: React.FC<BiomarkersTabProps> = ({
  biomarkers,
  isEditMode = false,
  selectedBiomarkerId = null,
  onDeleteBiomarker,
  onEditBiomarker,
  onAddBiomarker,
  navigation,
}) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Biomarkers</Text>
        {isEditMode && onAddBiomarker && (
          <TouchableOpacity style={styles.addButton} onPress={onAddBiomarker}>
            <Ionicons name="add" size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Biomarker</Text>
          </TouchableOpacity>
        )}
      </View>
      {biomarkers.map((biomarker) => (
        <BiomarkerItem
          key={biomarker.id}
          biomarker={biomarker}
          isEditMode={isEditMode}
          isSelected={selectedBiomarkerId === biomarker.id}
          onDelete={onDeleteBiomarker}
          onEdit={onEditBiomarker}
          navigation={navigation}
        />
      ))}
    </ScrollView>
  );
};

interface BiomarkerItemProps {
  biomarker: Biomarker;
  isEditMode?: boolean;
  isSelected?: boolean;
  onDelete?: (biomarkerId: string) => void;
  onEdit?: (biomarker: Biomarker) => void;
  navigation?: any;
}

const BiomarkerItem: React.FC<BiomarkerItemProps> = ({
  biomarker,
  isEditMode = false,
  isSelected = false,
  onDelete,
  onEdit,
  navigation,
}) => {
  const getAbnormalFlag = (flag?: string) => {
    const normalizedFlag = flag?.toLowerCase();
    if (normalizedFlag === "very high") {
      return <Text style={styles.abnormalVeryHigh}>▲</Text>;
    } else if (normalizedFlag === "high") {
      return <Text style={styles.abnormalHigh}>▲</Text>;
    } else if (normalizedFlag === "very low") {
      return <Text style={styles.abnormalVeryLow}>▼</Text>;
    } else if (normalizedFlag === "low") {
      return <Text style={styles.abnormalLow}>▼</Text>;
    } else {
      return <Text style={styles.normal}>●</Text>;
    }
  };

  const renderRightAction = (onPress: () => void) => {
    return (
      <View style={styles.deleteAction}>
        <TouchableOpacity style={styles.deleteButton} onPress={onPress}>
          <Ionicons name="trash" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(biomarker.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(biomarker);
    }
  };

  const biomarkerContent = (
    <Pressable
      style={({ pressed }) => [
        styles.biomarkerItem,
        isSelected && styles.biomarkerItemSelected,
        pressed && styles.biomarkerItemPressed,
      ]}
      onPress={
        isEditMode
          ? handleEdit
          : () => navigation?.navigate("BiomarkerDetails", { biomarker })
      }
    >
      <View style={styles.biomarkerLeft}>
        <Text style={styles.biomarkerName} numberOfLines={0}>
          {biomarker.marker_name}
        </Text>
      </View>
      <View style={styles.biomarkerRight}>
        <Text style={styles.biomarkerValue}>
          {biomarker.value} {biomarker.unit}
        </Text>
        {getAbnormalFlag(biomarker.abnormal_flag)}
      </View>
    </Pressable>
  );

  if (isEditMode) {
    return (
      <Swipeable
        renderRightActions={() => renderRightAction(handleDelete)}
        rightThreshold={30}
        containerStyle={styles.swipeableContainer}
      >
        {biomarkerContent}
      </Swipeable>
    );
  }

  return biomarkerContent;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  addButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  biomarkerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "white",
    minHeight: 60,
  },
  biomarkerItemSelected: {
    backgroundColor: "#f0f8ff",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  biomarkerItemPressed: {
    backgroundColor: "#e0e0e0",
  },
  biomarkerLeft: {
    flex: 3,
    marginRight: 12,
    paddingRight: 8,
  },
  biomarkerRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    minWidth: 100,
  },
  biomarkerName: {
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 20,
    flexWrap: "wrap",
  },
  biomarkerValue: {
    marginRight: 8,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "500",
  },
  abnormalVeryHigh: {
    color: "red",
  },
  abnormalHigh: {
    color: "orange",
  },
  abnormalVeryLow: {
    color: "red",
  },
  abnormalLow: {
    color: "orange",
  },
  normal: {
    color: "green",
  },
  deleteAction: {
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    minHeight: 60,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: "100%",
    paddingVertical: 16,
  },
  swipeableContainer: {
    backgroundColor: "white",
  },
});
