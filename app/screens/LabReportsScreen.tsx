import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../services/supabaseClient";
import { LabReport } from "../types/LabReport";
import { format } from "date-fns";

interface LabReportsScreenProps {
  reports: LabReport[];
  refreshing: boolean;
  onRefresh: () => void;
}

const LabReportsScreen: React.FC<LabReportsScreenProps> = ({
  reports,
  refreshing,
  onRefresh,
}) => {
  const renderReportItem = ({ item }: { item: LabReport }) => (
    <View
      style={{
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderColor: "#eee",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text>{item.laboratory_name}</Text>
        <Text>{item.description}</Text>
        <Text>{format(new Date(item.report_date), "d MMM yyyy")}</Text>
      </View>
      <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
        {item.extraction_status === "pending" ? (
          <Text style={{ color: "orange" }}>Analyzing...</Text>
        ) : (
          <Text style={{ color: "green" }}>Extracted ✅</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderReportItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default LabReportsScreen;
