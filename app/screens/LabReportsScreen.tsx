import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Button,
} from "react-native";
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
  const [filter, setFilter] = useState("By date Added");
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const applyFilter = (selectedFilter: string) => {
    setFilter(selectedFilter);
    toggleModal();
  };

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
      {reports.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            padding: 16,
          }}
        >
          <TouchableOpacity onPress={toggleModal}>
            <Text style={{ color: "blue" }}>{filter}</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderReportItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableOpacity
          style={{ flex: 1, justifyContent: "flex-end" }}
          activeOpacity={1}
          onPressOut={toggleModal}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <Button
              title="By date Added"
              onPress={() => applyFilter("By date added")}
            />
            <Button
              title="By document date"
              onPress={() => applyFilter("By document date")}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default LabReportsScreen;
