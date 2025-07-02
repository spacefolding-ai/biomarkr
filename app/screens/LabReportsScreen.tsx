import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { format } from "date-fns";
import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../navigation/types";

import { FileText } from "lucide-react-native";
import { useMemo } from "react";
import ExtractionProgressBar from "../components/ExtractionProgressBar";
import { ThumbnailLoader } from "../components/ThumbnailLoader";
import { debugLabReports } from "../services/labReports";
import { useAuthStore } from "../store/useAuthStore";
import { useLabReportsStore } from "../store/useLabReportsStore";
import { ExtractionStatus } from "../types/ExtractionStatus.enum";
import { LabReport } from "../types/LabReport";

interface LabReportsScreenProps {
  refreshing: boolean;
  onRefresh: () => void;
  navigation?: any;
}

const LabReportsScreen: React.FC<LabReportsScreenProps> = ({
  refreshing,
  onRefresh,
  navigation: propNavigation,
}) => {
  const [filter, setFilter] = useState("By date Added");
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();

  // Get reports directly from the store to ensure immediate re-renders on updates
  const { reports } = useLabReportsStore();

  // Debug: Log when reports change
  useEffect(() => {
    console.log("LabReportsScreen: reports changed, count:", reports.length);
    if (reports.length > 0) {
      console.log(
        "Latest report:",
        reports[0]?.laboratory_name,
        reports[0]?.extraction_status
      );
    }
  }, [reports]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const applyFilter = (selectedFilter: string) => {
    setFilter(selectedFilter);
    toggleModal();
  };

  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
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
  }, [reports, filter]);

  const handleRefresh = useCallback(async () => {
    console.log("🔄 Manual refresh triggered");

    // Debug: Check what's actually in the database
    if (user?.id) {
      await debugLabReports(user.id);
    }

    // Side-by-side subscription test
    console.log("🧪 Side-by-side subscription comparison test");

    // Test both tables with identical setup
    // DISABLED: Realtime subscription tests disabled to avoid CLOSED status issues
    // const testBiomarkers = () => {
    //   const biomarkersChannel = supabase.channel(
    //     `test_biomarkers_${Date.now()}`
    //   );
    //   biomarkersChannel
    //     .on(
    //       "postgres_changes",
    //       { event: "INSERT", schema: "public", table: "biomarkers" },
    //       (payload) => console.log("🧪 Biomarkers test event:", payload)
    //     )
    //     .subscribe((status) => {
    //       console.log("🧪 Biomarkers test status:", status);
    //       if (status !== "CHANNEL_ERROR" && status !== "TIMED_OUT") {
    //         setTimeout(() => biomarkersChannel.unsubscribe(), 2000);
    //       }
    //     });
    // };

    // const testLabReports = () => {
    //   const labReportsChannel = supabase.channel(
    //     `test_lab_reports_${Date.now()}`
    //   );
    //   labReportsChannel
    //     .on(
    //       "postgres_changes",
    //       { event: "INSERT", schema: "public", table: "lab_reports" },
    //       (payload) => console.log("🧪 Lab reports test event:", payload)
    //     )
    //     .subscribe((status) => {
    //       console.log("🧪 Lab reports test status:", status);
    //       if (status !== "CHANNEL_ERROR" && status !== "TIMED_OUT") {
    //         setTimeout(() => labReportsChannel.unsubscribe(), 2000);
    //       }
    //     });
    // };

    // console.log("🧪 Testing biomarkers subscription...");
    // testBiomarkers();

    // setTimeout(() => {
    //   console.log("🧪 Testing lab_reports subscription...");
    //   testLabReports();
    // }, 500);

    onRefresh();
  }, [onRefresh, user?.id]);

  const renderReportItem = ({ item }: { item: LabReport }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.extraction_status === ExtractionStatus.DONE) {
            navigation.navigate("LabReportDetails", { labReport: item });
          }
        }}
      >
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
          {item?.extraction_status === ExtractionStatus.DONE &&
            item?.description && (
              <>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/\.(jpeg|png|jpg)$/i.test(item?.file_name) ? (
                    <ThumbnailLoader path={item.thumbnail_path} size={56} />
                  ) : (
                    <FileText size={56} color="#000" />
                  )}
                  <View style={{ marginLeft: 8 }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {item?.laboratory_name}
                    </Text>
                    <Text style={{ color: "#444" }}>{item?.description}</Text>

                    {item?.report_date &&
                      !isNaN(Date.parse(item.report_date)) && (
                        <Text style={{ color: "#888" }}>
                          {format(new Date(item.report_date), "d MMM yyyy")}
                        </Text>
                      )}
                  </View>
                </View>
                <Text style={{ color: "green", fontSize: 12, marginLeft: 10 }}>
                  Extracted ✅
                </Text>
              </>
            )}

          {item?.extraction_status !== ExtractionStatus.DONE && (
            <View style={{ flex: 3 }}>
              <ExtractionProgressBar status={item?.extraction_status} />
              <Text style={{ marginTop: 8, color: "#555" }}>Analyzing...</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
            }}
          >
            <TouchableOpacity
              onPress={handleRefresh}
              style={{
                backgroundColor: "#007AFF",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "white", fontSize: 12 }}>
                {refreshing ? "Refreshing..." : "Manual Refresh"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleModal}>
              <Text style={{ color: "blue" }}>{filter}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={sortedReports}
            keyExtractor={(item, index) =>
              `${item?.id || `temp-${index}`}-${item?.created_at || Date.now()}`
            }
            renderItem={renderReportItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            extraData={reports}
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
                  onPress={() => {
                    applyFilter("By date Added");
                  }}
                />
                <Button
                  title="By document date"
                  onPress={() => {
                    applyFilter("By document date");
                  }}
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
