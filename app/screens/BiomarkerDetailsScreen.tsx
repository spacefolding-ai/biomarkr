import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BiomarkerTrendChart } from "../components/BiomarkerTrendChart";
import {
  getBiomarkerHistoricalData,
  updateBiomarkerFavouriteStatus,
} from "../services/biomarkers";
import { useAuthStore } from "../store/useAuthStore";
import { Biomarker } from "../types/Biomarker";

interface BiomarkerDetailsScreenProps {
  route: {
    params: {
      biomarker: Biomarker;
    };
  };
  navigation: any;
}

const BiomarkerDetailsScreen: React.FC<BiomarkerDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { biomarker } = route.params;
  const { user } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(biomarker.is_favourite || false);
  const [historicalData, setHistoricalData] = useState<Biomarker[]>([]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleToggleFavorite = async () => {
    try {
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus);
      await updateBiomarkerFavouriteStatus(biomarker.id, newFavoriteStatus);
    } catch (error) {
      // Revert state on error
      setIsFavorite(isFavorite);
      console.error("Failed to update favorite status:", error);
    }
  };

  const handleSend = () => {
    // TODO: Implement send functionality
  };

  const getAbnormalFlagDisplay = (flag?: string) => {
    const normalizedFlag = flag?.toLowerCase();
    if (normalizedFlag === "very high") {
      return { symbol: "▲", color: "red", text: "Very High" };
    } else if (normalizedFlag === "high") {
      return { symbol: "▲", color: "orange", text: "High" };
    } else if (normalizedFlag === "very low") {
      return { symbol: "▼", color: "red", text: "Very Low" };
    } else if (normalizedFlag === "low") {
      return { symbol: "▼", color: "orange", text: "Low" };
    } else {
      return { symbol: "●", color: "green", text: "Normal" };
    }
  };

  const abnormalFlag = getAbnormalFlagDisplay(biomarker.abnormal_flag);

  // Helper function to parse range strings into arrays
  const parseRangeToArray = (range?: string): [number, number] | undefined => {
    if (!range) return undefined;

    const patterns = [
      /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/, // "4.0-11.0"
      /(\d+(?:\.\d+)?)\s*–\s*(\d+(?:\.\d+)?)/, // "4.0–11.0" (en dash)
      /(\d+(?:\.\d+)?)\s*—\s*(\d+(?:\.\d+)?)/, // "4.0—11.0" (em dash)
      /(\d+(?:\.\d+)?)\s*to\s*(\d+(?:\.\d+)?)/i, // "4.0 to 11.0"
    ];

    for (const pattern of patterns) {
      const match = range?.match(pattern);
      if (match) {
        return [parseFloat(match[1]), parseFloat(match[2])];
      }
    }
    return undefined;
  };

  const referenceRange = parseRangeToArray(biomarker.standard_values);
  const optimalRange = parseRangeToArray(biomarker.optimal_values);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!user?.id) return;

      try {
        const data = await getBiomarkerHistoricalData(
          biomarker.marker_name,
          user.id
        );
        setHistoricalData(data);
      } catch (error) {
        console.error("Failed to fetch historical data:", error);
      }
    };

    fetchHistoricalData();
  }, [biomarker.marker_name, user?.id]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={styles.iconButton}
          >
            <Ionicons
              name={isFavorite ? "star" : "star-outline"}
              size={24}
              color={isFavorite ? "#FFD700" : "#000"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSend} style={styles.iconButton}>
            <Ionicons name="send" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Biomarker Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{biomarker.marker_name}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Combined Value and Ranges Card */}
        <View style={styles.valueCard}>
          {/* Top row: abnormal flag and date */}
          <View style={styles.topRow}>
            <View style={styles.statusContainer}>
              <Text
                style={[styles.statusSymbol, { color: abnormalFlag.color }]}
              >
                {abnormalFlag.symbol}
              </Text>
              <Text style={[styles.statusText, { color: abnormalFlag.color }]}>
                {abnormalFlag.text}
              </Text>
            </View>

            {biomarker.report_date && (
              <Text style={styles.dateText}>
                {new Date(biomarker.report_date).toLocaleDateString()}
              </Text>
            )}
          </View>

          {/* Value and unit */}
          <Text style={styles.currentValue}>
            {biomarker.value} {biomarker.unit}
          </Text>

          {/* Reference ranges section */}
          <View style={styles.rangesSection}>
            {biomarker.standard_values && (
              <View style={styles.rangeItem}>
                <View style={styles.rangeIndicator}>
                  <View
                    style={[styles.rangeDot, { backgroundColor: "#34C759" }]}
                  />
                  <Text style={styles.rangeLabel}>Normal</Text>
                </View>
                <Text style={styles.rangeValue} numberOfLines={0}>
                  {biomarker.standard_values}
                </Text>
              </View>
            )}

            {biomarker.optimal_values && (
              <View style={styles.rangeItem}>
                <View style={styles.rangeIndicator}>
                  <View
                    style={[styles.rangeDot, { backgroundColor: "#007AFF" }]}
                  />
                  <Text style={styles.rangeLabel}>Optimal</Text>
                </View>
                <Text style={styles.rangeValue} numberOfLines={0}>
                  {biomarker.optimal_values}
                </Text>
              </View>
            )}

            {/* Reference range if available and different from standard values */}
            {biomarker.reference_range && (
              <View style={styles.rangeItem}>
                <View style={styles.rangeIndicator}>
                  <View
                    style={[styles.rangeDot, { backgroundColor: "#8E8E93" }]}
                  />
                  <Text style={styles.rangeLabel}>Reference</Text>
                </View>
                <Text style={styles.rangeValue} numberOfLines={0}>
                  {biomarker.reference_range}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Biomarker Trend Chart */}
        {historicalData.length >= 1 && (
          <BiomarkerTrendChart
            data={historicalData.map((item) => ({
              date: item.report_date,
              value: item.value,
              abnormal_flag: item.abnormal_flag || undefined,
              report_id: item.report_id,
            }))}
            unit={biomarker.unit}
            markerName={biomarker.marker_name}
            referenceRange={referenceRange}
            optimalRange={optimalRange}
            navigation={navigation}
          />
        )}

        {/* Information Sections */}
        {biomarker.about && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionContent}>{biomarker.about}</Text>
          </View>
        )}

        {biomarker.what_deviations_mean && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>What Deviations Mean</Text>
            <Text style={styles.sectionContent}>
              {biomarker.what_deviations_mean}
            </Text>
          </View>
        )}

        {biomarker.when_is_test_prescribed && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>When is Test Prescribed</Text>
            <Text style={styles.sectionContent}>
              {biomarker.when_is_test_prescribed}
            </Text>
          </View>
        )}

        {biomarker.standard_values && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Standard Values</Text>
            <Text style={styles.sectionContent}>
              {biomarker.standard_values}
            </Text>
          </View>
        )}

        {biomarker.optimal_values && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Optimal Values</Text>
            <Text style={styles.sectionContent}>
              {biomarker.optimal_values}
            </Text>
          </View>
        )}

        {biomarker.testing_methods && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Testing Methods</Text>
            <Text style={styles.sectionContent}>
              {biomarker.testing_methods}
            </Text>
          </View>
        )}

        {biomarker.which_specialist_is_needed && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Which Specialist is Needed</Text>
            <Text style={styles.sectionContent}>
              {biomarker.which_specialist_is_needed}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  valueCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusSymbol: {
    fontSize: 16,
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  currentValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  rangesSection: {
    marginBottom: 12,
    justifyContent: "space-between",
  },
  rangeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 4,
    overflow: "hidden",
  },
  rangeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  rangeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    flexShrink: 0,
  },
  rangeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flexShrink: 0,
  },
  rangeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
    textAlign: "right",
    flexShrink: 1,
    maxWidth: "50%",
  },
  referenceRange: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#3C3C43",
  },
});

export default BiomarkerDetailsScreen;
