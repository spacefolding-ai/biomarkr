import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import BiomarkersScreen from "./BiomarkersScreen";

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

const LabDocumentsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Lab Reports</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
  },
});

export default HealthLabScreen;
