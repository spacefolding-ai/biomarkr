import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Biomarker } from "../types/Biomarker";

interface BiomarkersTabProps {
  biomarkers: Biomarker[];
}

export const BiomarkersTab: React.FC<BiomarkersTabProps> = ({ biomarkers }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subtitle}>Biomarkers</Text>
      {biomarkers.map((biomarker) => (
        <BiomarkerItem key={biomarker.id} biomarker={biomarker} />
      ))}
    </ScrollView>
  );
};

interface BiomarkerItemProps {
  biomarker: Biomarker;
}

const BiomarkerItem: React.FC<BiomarkerItemProps> = ({ biomarker }) => {
  const getAbnormalFlag = (flag?: string) => {
    const normalizedFlag = flag?.toLowerCase();
    if (normalizedFlag === "high") {
      return <Text style={styles.abnormalHigh}>▲</Text>;
    } else if (normalizedFlag === "low") {
      return <Text style={styles.abnormalLow}>▼</Text>;
    } else {
      return <Text style={styles.normal}>●</Text>;
    }
  };

  return (
    <View style={styles.biomarkerItem}>
      <Text style={styles.biomarkerName}>{biomarker.marker_name}</Text>
      <View style={styles.biomarkerDetails}>
        <Text style={styles.biomarkerValue}>
          {biomarker.value} {biomarker.unit}
        </Text>
        {getAbnormalFlag(biomarker.abnormal_flag)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  biomarkerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  biomarkerName: {
    fontWeight: "bold",
  },
  biomarkerDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  biomarkerValue: {
    marginRight: 8,
  },
  abnormalHigh: {
    color: "orange",
  },
  abnormalLow: {
    color: "orange",
  },
  normal: {
    color: "green",
  },
});
