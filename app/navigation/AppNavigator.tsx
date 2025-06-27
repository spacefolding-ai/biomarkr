import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { LogIn, UserPlus } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { AppIcon, IconName } from "../components/IconRegistry";
import HealthLabScreen from "../screens/HealthLabScreen";
import LabAssistantScreen from "../screens/LabAssistantScreen";
import LabReportDetailsScreen from "../screens/LabReportDetailsScreen";
import LoginScreen from "../screens/LoginScreen";
import MoreScreen from "../screens/MoreScreen";
import OverviewScreen from "../screens/OverviewScreen";
import SignupScreen from "../screens/SignupScreen";
import UploadScreen from "../screens/UploadScreen";
import { getAllBiomarkers } from "../services/biomarkers";
import { useBiomarkersStore } from "../store/useBiomarkersStore";
import { useLabReportsStore } from "../store/useLabReportsStore";
import { RootStackParamList } from "./types";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const AuthTabNavigator = () => (
  <Tab.Navigator id={undefined} screenOptions={{ headerShown: false }}>
    <Tab.Screen
      name="Login"
      component={LoginScreen}
      options={{
        tabBarIcon: ({ color, size }) => <LogIn color={color} size={size} />,
      }}
    />
    <Tab.Screen
      name="Signup"
      component={SignupScreen}
      options={{
        tabBarIcon: ({ color, size }) => <UserPlus color={color} size={size} />,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { deleteReport } = useLabReportsStore();
  const { setBiomarkers } = useBiomarkersStore();

  const toggleEditMode = (navigation, route) => {
    if (isEditMode) {
      // Check if there are any changes before showing confirmation dialog
      const getHasChanges = route.params?.getHasChanges;
      const hasChanges = getHasChanges ? getHasChanges() : false;

      if (hasChanges) {
        // Show confirmation dialog when there are changes
        Alert.alert(
          "Save Changes",
          "Do you want to save the changes you made to this lab report?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                // Revert changes and exit edit mode
                setIsEditMode(false);
                navigation.setParams({ isEditMode: false, shouldRevert: true });
              },
            },
            {
              text: "Save",
              style: "default",
              onPress: () => {
                // Save changes and exit edit mode
                setIsEditMode(false);
                navigation.setParams({ isEditMode: false, shouldSave: true });
              },
            },
          ]
        );
      } else {
        // No changes, just exit edit mode
        setIsEditMode(false);
        navigation.setParams({ isEditMode: false });
      }
    } else {
      // Enter edit mode
      setIsEditMode(true);
      navigation.setParams({ isEditMode: true });
    }
  };

  const confirmDelete = (id, navigation) => {
    Alert.alert(
      "Are you sure you want to delete Lab Result?",
      "All result's biomarkers will be lost",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(id, navigation),
        },
      ]
    );
  };

  const handleDelete = async (id: string, navigation: any) => {
    setIsEditMode(false);
    await deleteReport(id);
    const biomarkers = await getAllBiomarkers();
    setBiomarkers(biomarkers);
    navigation.goBack();
  };

  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthTabNavigator} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen
        name="LabReportDetails"
        component={LabReportDetailsScreen}
        initialParams={isEditMode}
        options={({ navigation, route }) => ({
          title: "Lab Report",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={
                isEditMode
                  ? () => confirmDelete(route.params.labReport.id, navigation)
                  : () => navigation.goBack()
              }
              style={{ marginLeft: 10 }}
            >
              <Ionicons
                name={isEditMode ? "trash" : "arrow-back"}
                size={28}
                color="black"
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => toggleEditMode(navigation, route)}
              style={{ marginRight: 10 }}
            >
              <Ionicons
                name={isEditMode ? "checkmark" : "pencil"}
                size={24}
                color="black"
              />
            </TouchableOpacity>
          ),
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 24,
            color: "black",
          },
          headerStyle: {
            backgroundColor: "white",
            shadowColor: "transparent",
          },
          gestureEnabled: true,
        })}
      />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => (
  <Tab.Navigator
    id={undefined}
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName: IconName = "overview";

        switch (route.name) {
          case "Overview":
            iconName = "overview";
            break;
          case "Health Lab":
            iconName = "health-lab";
            break;
          case "Upload":
            iconName = "upload";
            break;
          case "Lab Assistant":
            iconName = "lab-assistant";
            break;
          case "More":
            iconName = "more";
            break;
        }

        return <AppIcon name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Overview" component={OverviewScreen} />
    <Tab.Screen name="Health Lab" component={HealthLabScreen} />
    <Tab.Screen name="Upload" component={UploadScreen} />
    <Tab.Screen name="Lab Assistant" component={LabAssistantScreen} />
    <Tab.Screen name="More" component={MoreScreen} />
  </Tab.Navigator>
);

export default AppNavigator;
