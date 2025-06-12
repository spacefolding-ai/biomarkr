import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OverviewScreen from '../screens/OverviewScreen';
import ParametersScreen from '../screens/ParametersScreen';
import UploadScreen from '../screens/UploadScreen';
import LabAssistantScreen from '../screens/LabAssistantScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { AppIcon } from '@components/IconRegistry';
import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthTabNavigator = () => (
  <Tab.Navigator
    id={undefined}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Login" component={LoginScreen} />
    <Tab.Screen name="Signup" component={SignupScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
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
        let iconName: any = 'overview';

        switch (route.name) {
          case 'Overview':
            iconName = 'overview';
            break;
          case 'Parameters':
            iconName = 'parameters';
            break;
          case 'Upload':
            iconName = 'upload';
            break;
          case 'Lab Assistant':
            iconName = 'lab';
            break;
          case 'Settings':
            iconName = 'settings';
            break;
        }

        return <AppIcon name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Overview" component={OverviewScreen} />
    <Tab.Screen name="Parameters" component={ParametersScreen} />
    <Tab.Screen name="Upload" component={UploadScreen} />
    <Tab.Screen name="Lab Assistant" component={LabAssistantScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export default AppNavigator;