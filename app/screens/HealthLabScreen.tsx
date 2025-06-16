import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import BiomarkersScreen from "./BiomarkersScreen";
import LabDocumentsScreen from "./LabDocumentsScreen";

const Tab = createMaterialTopTabNavigator();

const HealthLabScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator>
        <Tab.Screen name="Biomarkers" component={BiomarkersScreen} />
        <Tab.Screen name="Lab Reports" component={LabDocumentsScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default HealthLabScreen;
