import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

const BiomarkersScreen: React.FC<BiomarkersScreenProps> = ({
  biomarkers,
  refreshing,
  onRefresh,
}) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const groupedBiomarkers = useMemo(() => {
    const filtered = biomarkers.filter((b) =>
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
  }, [biomarkers, searchText]);

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    setSearchText("");
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
              justifyContent: "flex-end",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginTop: 16,
              backgroundColor: "white",
            }}
          >
            {searchVisible ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 8,
                  flex: 1,
                  marginRight: 8,
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
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <TouchableOpacity
              onPress={toggleSearch}
              style={{ justifyContent: "center", paddingVertical: 8 }}
            >
              {searchVisible ? (
                <Text style={{ color: "red" }}>Cancel</Text>
              ) : (
                <Ionicons name="search" size={24} color="black" />
              )}
            </TouchableOpacity>
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
    </View>
  );
};

export default BiomarkersScreen;
