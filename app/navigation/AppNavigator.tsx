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
      // @ts-ignore - Required for React Navigation v7
      id={undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'ios-alert';

          switch (route.name) {
            case 'Overview':
              iconName = focused ? 'ios-information-circle' : 'ios-information-circle-outline';
              break;
            case 'Parameters':
              iconName = focused ? 'ios-list-box' : 'ios-list';
              break;
            case 'Upload':
              iconName = focused ? 'ios-cloud-upload' : 'ios-cloud-upload-outline';
              break;
            case 'Lab Assistant':
              iconName = focused ? 'ios-flask' : 'ios-flask-outline';
              break;
            case 'Settings':
              iconName = focused ? 'ios-settings' : 'ios-settings-outline';
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