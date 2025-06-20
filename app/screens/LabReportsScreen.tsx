import { format } from "date-fns";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LabReport } from "../types/LabReport";

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

  const toggleModal = () => setModalVisible(!isModalVisible);

  const applyFilter = (selectedFilter: string) => {
    setFilter(selectedFilter);
    toggleModal();
  };

  const sortedReports = [...reports].sort((a, b) => {
    if (filter === "By document date") {
      return (
        new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
      );
    } else {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  });

  const renderReportItem = ({ item }: { item: LabReport }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: "#eee",
      }}
    >
      <View style={{ flex: 3 }}>
        <Text style={{ fontWeight: "bold" }}>{item?.laboratory_name}</Text>
        <Text style={{ color: "#444" }}>{item?.description}</Text>
        <Text style={{ color: "#888" }}>
          {format(new Date(item?.report_date), "d MMM yyyy")}
        </Text>
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        {item?.extraction_status === "pending" ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ActivityIndicator
              size="small"
              color="orange"
              style={{ marginRight: 5 }}
            />
            <Text style={{ color: "orange" }}>Analyzing...</Text>
          </View>
        ) : (
          <Text style={{ color: "green", fontWeight: "bold" }}>
            Extracted ✅
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {reports.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            marginTop: 32,
            paddingHorizontal: 16,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000" }}>
            No Lab Results
          </Text>
          <Text style={{ textAlign: "center", color: "#666", marginTop: 8 }}>
            Take a photo or upload an image or PDF of your lab report
          </Text>
        </View>
      ) : (
        <>
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

          <FlatList
            data={sortedReports}
            keyExtractor={(item, index) => `${item?.id}-${index}`}
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
                  onPress={() => applyFilter("By date Added")}
                />
                <Button
                  title="By document date"
                  onPress={() => applyFilter("By document date")}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      )}
    </View>
  );
};

export default LabReportsScreen;
