import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { format, subMonths, subYears } from "date-fns";
import React, { useCallback, useMemo, useState } from "react";
import {
  Button,
  RefreshControl,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { Biomarker } from "../types/Biomarker";

interface BiomarkersScreenProps {
  biomarkers: Biomarker[];
  refreshing: boolean;
  onRefresh: () => void;
}

interface BiomarkerSection {
  title: string;
  data: Biomarker[];
}

type TimePeriod = "all time" | "last year" | "last six months";

const BiomarkersScreen: React.FC<BiomarkersScreenProps> = ({
  biomarkers,
  refreshing,
  onRefresh,
}) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState<TimePeriod>("all time");
  const [isTimePeriodModalVisible, setTimePeriodModalVisible] = useState(false);
  const [tempTimePeriod, setTempTimePeriod] = useState<TimePeriod>("all time");

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const groupedBiomarkers = useMemo(() => {
    // First filter by time period
    let filteredByTime = biomarkers;
    const now = new Date();

    // Helper function to safely parse date and handle edge cases
    const parseReportDate = (dateString: string): Date | null => {
      if (!dateString) return null;

      // Try parsing the date string
      const parsed = new Date(dateString);

      // Check if the date is valid
      if (isNaN(parsed.getTime())) {
        return null;
      }

      return parsed;
    };

    if (selectedTimePeriod === "last year") {
      const lastYear = subYears(now, 1);

      filteredByTime = biomarkers.filter((biomarker) => {
        const reportDate = parseReportDate(biomarker.report_date);

        if (!reportDate) {
          return false;
        }

        const isWithinPeriod = reportDate >= lastYear && reportDate <= now;
        return isWithinPeriod;
      });
    } else if (selectedTimePeriod === "last six months") {
      const lastSixMonths = subMonths(now, 6);

      filteredByTime = biomarkers.filter((biomarker) => {
        const reportDate = parseReportDate(biomarker.report_date);

        if (!reportDate) {
          return false;
        }

        const isWithinPeriod = reportDate >= lastSixMonths && reportDate <= now;
        return isWithinPeriod;
      });
    }

    // Then filter by search text
    const filtered = filteredByTime.filter((b) =>
      (b.marker_name?.toLowerCase() || "").includes(searchText?.toLowerCase())
    );

    // Group biomarkers by biomarker_group
    const groups = filtered.reduce((acc, biomarker) => {
      const group = biomarker.biomarker_group || "Other";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(biomarker);
      return acc;
    }, {} as Record<string, Biomarker[]>);

    // Convert to SectionList format and sort groups
    return Object.entries(groups)
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [biomarkers, searchText, selectedTimePeriod]);

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    setSearchText("");
  };

  const toggleTimePeriodModal = () => {
    if (!isTimePeriodModalVisible) {
      setTempTimePeriod(selectedTimePeriod);
    }
    setTimePeriodModalVisible(!isTimePeriodModalVisible);
  };

  const handleDone = () => {
    setSelectedTimePeriod(tempTimePeriod);
    setTimePeriodModalVisible(false);
  };

  const handleCancel = () => {
    setTempTimePeriod(selectedTimePeriod); // Reset to original selection
    setTimePeriodModalVisible(false);
  };

  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  const renderBiomarkerItem = ({ item }: { item: Biomarker }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderColor: "#eee",
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontWeight: "bold", flex: 1, marginRight: 16 }}>
          {item?.marker_name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-end",
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "500" }}>
              {item?.value} {item?.unit}
            </Text>

            {item?.report_date && !isNaN(Date.parse(item.report_date)) && (
              <Text style={{ color: "#666", fontSize: 12 }}>
                {format(new Date(item.report_date), "d MMM yyyy")}
              </Text>
            )}
          </View>

          {item?.abnormal_flag?.toLowerCase() === "very high" ? (
            <Text style={{ color: "red", fontSize: 16 }}>▲</Text>
          ) : item?.abnormal_flag?.toLowerCase() === "high" ? (
            <Text style={{ color: "orange", fontSize: 16 }}>▲</Text>
          ) : item?.abnormal_flag?.toLowerCase() === "very low" ? (
            <Text style={{ color: "red", fontSize: 16 }}>▼</Text>
          ) : item?.abnormal_flag?.toLowerCase() === "low" ? (
            <Text style={{ color: "orange", fontSize: 16 }}>▼</Text>
          ) : (
            <Text style={{ color: "green", fontSize: 16 }}>●</Text>
          )}
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: BiomarkerSection }) => {
    return (
      <View
        style={{
          backgroundColor: "#f8f9fa",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: "#e9ecef",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#6c757d",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {section.title}
        </Text>
      </View>
    );
  };

  const getTimePeriodDisplayName = (period: TimePeriod) => {
    switch (period) {
      case "all time":
        return "All time";
      case "last year":
        return "Last year";
      case "last six months":
        return "Last six months";
      default:
        return period;
    }
  };

  // Dynamic styles based on color scheme
  const dynamicStyles = {
    modalContent: {
      backgroundColor: isDarkMode ? "#1c1c1e" : "white",
    },
    modalHeader: {
      borderColor: isDarkMode ? "#48484a" : "#ccc",
    },
    modalTitle: {
      color: isDarkMode ? "white" : "black",
    },
  };

  const renderTimePeriodModal = () => {
    return (
      <ReactNativeModal
        isVisible={isTimePeriodModalVisible}
        onBackdropPress={handleCancel}
        style={{
          justifyContent: "flex-end",
          margin: 0,
        }}
        {...({} as any)}
      >
        <View
          style={[
            {
              borderRadius: 10,
              alignItems: "center",
              height: "33%",
            },
            dynamicStyles.modalContent,
          ]}
        >
          <View
            style={[
              {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                paddingHorizontal: 10,
                height: 50,
                borderBottomWidth: 1,
              },
              dynamicStyles.modalHeader,
            ]}
          >
            <Button
              title="Cancel"
              onPress={handleCancel}
              color={isDarkMode ? "#007AFF" : undefined}
            />
            <Text
              style={[
                {
                  fontSize: 18,
                  fontWeight: "500",
                },
                dynamicStyles.modalTitle,
              ]}
            >
              Time Period
            </Text>
            <Button
              title="Done"
              onPress={handleDone}
              color={isDarkMode ? "#007AFF" : undefined}
            />
          </View>
          <Picker
            selectedValue={tempTimePeriod}
            onValueChange={(itemValue) => setTempTimePeriod(itemValue)}
            style={{
              width: "100%",
              flex: 1,
              color: isDarkMode ? "white" : "black",
            }}
            itemStyle={{
              color: isDarkMode ? "white" : "black",
            }}
          >
            <Picker.Item label="All time" value="all time" />
            <Picker.Item label="Last year" value="last year" />
            <Picker.Item label="Last six months" value="last six months" />
          </Picker>
        </View>
      </ReactNativeModal>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      {biomarkers.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000" }}>
            Biomarkers will appear here
          </Text>
          <Text style={{ textAlign: "center", color: "#666", marginTop: 8 }}>
            Take a photo or upload an image or PDF of your lab report to extract
            biomarkers
          </Text>
        </View>
      ) : (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginTop: 16,
              backgroundColor: "white",
            }}
          >
            <TouchableOpacity
              onPress={toggleTimePeriodModal}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f0f0f0",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#000",
                  marginRight: 4,
                }}
              >
                {getTimePeriodDisplayName(selectedTimePeriod)}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {searchVisible && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderColor: "#ccc",
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 8,
                    marginRight: 8,
                    minWidth: 200,
                  }}
                >
                  <Ionicons
                    name="search"
                    size={16}
                    color="#ccc"
                    style={{ marginRight: 5 }}
                  />
                  <TextInput
                    style={{ flex: 1 }}
                    placeholder="Search by biomarker name"
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                </View>
              )}

              <TouchableOpacity
                onPress={toggleSearch}
                style={{
                  justifyContent: "center",
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                }}
              >
                {searchVisible ? (
                  <Text style={{ color: "red", fontSize: 16 }}>Cancel</Text>
                ) : (
                  <Ionicons name="search" size={24} color="black" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <SectionList
            sections={groupedBiomarkers}
            keyExtractor={(item) => `${item?.id}-${item?.created_at}`}
            renderItem={renderBiomarkerItem}
            renderSectionHeader={renderSectionHeader}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            stickySectionHeadersEnabled={true}
          />
        </>
      )}

      {renderTimePeriodModal()}
    </View>
  );
};

export default BiomarkersScreen;
