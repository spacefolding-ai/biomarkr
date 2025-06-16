import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import OverviewScreen from "../screens/OverviewScreen";
import UploadScreen from "../screens/UploadScreen";
import LabAssistantScreen from "../screens/LabAssistantScreen";
import { AppIcon } from "../components/IconRegistry";
import { createStackNavigator } from "@react-navigation/stack";
import SignupScreen from "../screens/SignupScreen";
import LoginScreen from "../screens/LoginScreen";
import { LogIn, UserPlus, MoreHorizontal } from "lucide-react-native";
import HealthLabScreen from "../screens/HealthLabScreen";
import MoreScreen from "../screens/MoreScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
      {/* TODO temp disable auth */}
      <Stack.Screen name="Auth" component={AuthTabNavigator} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => (
  <Tab.Navigator
    id={undefined}
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName: any = "overview";

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
          case "Settings":
            iconName = "settings";
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
