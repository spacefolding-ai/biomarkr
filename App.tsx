import React from 'react';
import { View, Text, AppRegistry } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>🚀 HealthIQ App booted successfully!</Text>
    </View>
  );
}

AppRegistry.registerComponent('main', () => App);