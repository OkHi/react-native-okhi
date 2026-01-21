import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './screens/LoginScreen';
import { VerificationScreen } from './screens/VerificationScreen';
import { HelpersScreen } from './screens/HelpersScreen';

export type RootStackParamList = {
  Login: undefined;
  Verification: undefined;
  Helpers: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            gestureEnabled: false,
            title: 'Login',
          }}
        />
        <Stack.Screen
          name="Verification"
          component={VerificationScreen}
          options={{
            gestureEnabled: false,
            title: 'Verification',
          }}
        />
        <Stack.Screen
          name="Helpers"
          component={HelpersScreen}
          options={{ title: 'Helpers' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
