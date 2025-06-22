import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { LogIn, UserPlus } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { AppIcon, IconName } from "../components/IconRegistry";
import HealthLabScreen from "../screens/HealthLabScreen";
import LabAssistantScreen from "../screens/LabAssistantScreen";
import LabReportDetailsScreen from "../screens/LabReportDetailsScreen";
import LoginScreen from "../screens/LoginScreen";
import MoreScreen from "../screens/MoreScreen";
import OverviewScreen from "../screens/OverviewScreen";
import SignupScreen from "../screens/SignupScreen";
import UploadScreen from "../screens/UploadScreen";
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
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthTabNavigator} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen
        name="LabReportDetails"
        component={LabReportDetailsScreen}
        options={({ navigation }) => ({
          title: "Lab Report",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                /* Future edit functionality */
              }}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="pencil" size={24} color="black" />
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
