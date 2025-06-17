import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { format } from "date-fns";
import { BiomarkerItem } from "../types/BiomarkerItem";

interface BiomarkersScreenProps {
  biomarkers: BiomarkerItem[];
  refreshing: boolean;
  onRefresh: () => void;
}

const BiomarkersScreen: React.FC<BiomarkersScreenProps> = ({
  biomarkers,
  refreshing,
  onRefresh,
}) => {
  const renderBiomarkerItem = ({ item }: { item: BiomarkerItem }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderColor: "#eee",
      }}
    >
      <Text style={{ fontWeight: "bold" }}>{item.marker_name}</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            flexDirection: "column",
            alignItems: "flex-end",
            marginRight: 8,
          }}
        >
          <Text>
            {item.value} {item.unit}
          </Text>
          <Text style={{ color: "#666" }}>
            {format(new Date(item.report_date), "d MMM yyyy")}
          </Text>
        </View>
        {item.abnormal_flag === null ? (
          <Text style={{ color: "green" }}>●</Text>
        ) : item.abnormal_flag.toLowerCase() === "high" ? (
          <Text style={{ color: "orange" }}>▲</Text>
        ) : (
          <Text style={{ color: "orange" }}>▼</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={biomarkers}
        keyExtractor={(item) => item.id}
        renderItem={renderBiomarkerItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default BiomarkersScreen;
