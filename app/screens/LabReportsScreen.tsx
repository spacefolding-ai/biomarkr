import { format } from "date-fns";
import React, { useCallback } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import ExtractionProgressBar from "../components/ExtractionProgressBar";
import { ExtractionStatus } from "../types/ExtractionStatus.enum";
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
  console.log("LabReportsScreen", reports);
  // const [filter, setFilter] = useState("By date Added");
  // const [isModalVisible, setModalVisible] = useState(false);

  // const toggleModal = () => setModalVisible(!isModalVisible);

  // const applyFilter = (selectedFilter: string) => {
  //   setFilter(selectedFilter);
  //   toggleModal();
  // };

  // const sortedReports = [...reports].sort((a, b) => {
  //   if (filter === "By document date") {
  //     return (
  //       new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
  //     );
  //   } else {
  //     return (
  //       new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  //     );
  //   }
  // });

  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  const renderReportItem = ({ item }: { item: LabReport }) => {
    return (
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
        {item?.extraction_status === ExtractionStatus.Done && (
          <>
            <View style={{ flex: 3 }}>
              <Text style={{ fontWeight: "bold" }}>
                {item?.laboratory_name}
              </Text>
              <Text style={{ color: "#444" }}>{item?.description}</Text>
              {item?.report_date && !isNaN(Date.parse(item.report_date)) && (
                <Text style={{ color: "#888" }}>
                  {format(new Date(item.report_date), "d MMM yyyy")}
                </Text>
              )}
            </View>
            <Text style={{ color: "green", fontSize: 12, marginLeft: 10 }}>
              Extracted ✅
            </Text>
          </>
        )}

        {item?.extraction_status !== ExtractionStatus.Done && (
          <View style={{ flex: 3 }}>
            <ExtractionProgressBar status={item?.extraction_status} />
            <Text style={{ marginTop: 8, color: "#555" }}>Analyzing...</Text>
          </View>
        )}
      </View>
    );
  };

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
          {/* <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              padding: 16,
            }}
          >
            <TouchableOpacity onPress={toggleModal}>
              <Text style={{ color: "blue" }}>{filter}</Text>
            </TouchableOpacity>
          </View> */}

          <FlatList
            data={reports}
            keyExtractor={(item) => `${item?.id}-${item?.created_at}`}
            renderItem={renderReportItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            extraData={reports}
          />

          {/* <Modal
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
          </Modal> */}
        </>
      )}
    </View>
  );
};

export default LabReportsScreen;
