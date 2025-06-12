import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OverviewScreen from '../screens/OverviewScreen';
import ParametersScreen from '../screens/ParametersScreen';
import UploadScreen from '../screens/UploadScreen';
import LabAssistantScreen from '../screens/LabAssistantScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { AppIcon } from '@components/IconRegistry';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
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
};

export default AppNavigator;