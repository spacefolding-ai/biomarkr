import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  const [isFavorite, setIsFavorite] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  const handleSend = () => {
    // TODO: Implement send functionality
    console.log("Send biomarker details");
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
        {/* Current Value Card */}
        <View style={styles.valueCard}>
          <View style={styles.valueHeader}>
            <Text style={styles.valueLabel}>Current Value</Text>
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
          </View>

          <Text style={styles.currentValue}>
            {biomarker.value} {biomarker.unit}
          </Text>

          {biomarker.reference_range && (
            <Text style={styles.referenceRange}>
              Reference Range: {biomarker.reference_range}
            </Text>
          )}

          {biomarker.report_date && (
            <Text style={styles.testDate}>
              Test Date: {new Date(biomarker.report_date).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Information Sections */}
        {biomarker.about && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionContent}>{biomarker.about}</Text>
          </View>
        )}

        {biomarker.what_deviations_mean && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>What Deviations Mean</Text>
            <Text style={styles.sectionContent}>
              {biomarker.what_deviations_mean}
            </Text>
          </View>
        )}

        {biomarker.when_is_test_prescribed && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>When is Test Prescribed</Text>
            <Text style={styles.sectionContent}>
              {biomarker.when_is_test_prescribed}
            </Text>
          </View>
        )}

        {biomarker.standard_values && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Standard Values</Text>
            <Text style={styles.sectionContent}>
              {biomarker.standard_values}
            </Text>
          </View>
        )}

        {biomarker.optimal_value && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Optimal Value</Text>
            <Text style={styles.sectionContent}>{biomarker.optimal_value}</Text>
          </View>
        )}

        {biomarker.testing_methods && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Testing Methods</Text>
            <Text style={styles.sectionContent}>
              {biomarker.testing_methods}
            </Text>
          </View>
        )}

        {biomarker.which_specialist_is_needed && (
          <View style={styles.infoSection}>
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
  },
  valueCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  valueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  valueLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
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
  currentValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  referenceRange: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  testDate: {
    fontSize: 14,
    color: "#666",
  },
  infoSection: {
    marginBottom: 24,
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
    color: "#333",
  },
});

export default BiomarkerDetailsScreen;
