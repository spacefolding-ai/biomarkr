import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OverviewScreen from '../screens/OverviewScreen';
import ParametersScreen from '../screens/ParametersScreen';
import UploadScreen from '../screens/UploadScreen';
import LabAssistantScreen from '../screens/LabAssistantScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: string = '';

          switch (route.name) {
            case 'Overview':
              iconName = 'home-outline';
              break;
            case 'Parameters':
              iconName = 'list-outline';
              break;
            case 'Upload':
              iconName = 'cloud-upload-outline';
              break;
            case 'Lab Assistant':
              iconName = 'chatbubble-ellipses-outline';
              break;
            case 'Settings':
              iconName = 'settings-outline';
              break;
            default:
              iconName = 'ellipse-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
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
};

export default AppNavigator;