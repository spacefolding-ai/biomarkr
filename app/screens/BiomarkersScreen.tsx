import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React, { memo, useState } from "react";
import {
  FlatList,
  RefreshControl,
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

const BiomarkersScreen: React.FC<BiomarkersScreenProps> = ({
  biomarkers,
  refreshing,
  onRefresh,
}) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredBiomarkers = biomarkers.filter((b) =>
    (b.marker_name?.toLowerCase() || "").includes(searchText?.toLowerCase())
  );

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    setSearchText("");
  };

  const handleRefresh = () => {
    onRefresh();
  };

  const renderBiomarkerItem = ({ item }: { item: Biomarker }) => {
    if (!item.marker_name || !item.value || !item.unit || !item.report_date) {
      return (
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#aaa" }}>Loading biomarker...</Text>
        </View>
      );
    }
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderColor: "#eee",
          width: "100%",
        }}
      >
        <Text style={{ fontWeight: "bold" }}>{item?.marker_name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-end",
              marginRight: 8,
            }}
          >
            <Text>
              {item?.value} {item?.unit}
            </Text>

            {item?.report_date && !isNaN(Date.parse(item.report_date)) && (
              <Text style={{ color: "#666" }}>
                {format(new Date(item.report_date), "d MMM yyyy")}
              </Text>
            )}
          </View>

          {item?.abnormal_flag === "high" ? (
            <Text style={{ color: "orange" }}>▲</Text>
          ) : item?.abnormal_flag === "low" ? (
            <Text style={{ color: "orange" }}>▼</Text>
          ) : (
            <Text style={{ color: "green" }}>●</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {biomarkers.length === 0 ? (
        <View style={{ alignItems: "center" }}>
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

          <FlatList
            data={searchVisible ? filteredBiomarkers : biomarkers}
            keyExtractor={(item, index) => `${item?.id}-${index}`}
            renderItem={renderBiomarkerItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            contentContainerStyle={{ paddingTop: 0 }}
          />
        </>
      )}
    </View>
  );
};

export default memo(BiomarkersScreen);
