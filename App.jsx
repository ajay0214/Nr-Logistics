import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './components/ThemeContext';
import LoginScreen from './pages/Loginscreen';
import Dashboard from './pages/Dashboard';
import Delivery from './pages/Delivery';
import Orders from './pages/Orders';
import Pickup from './pages/Pickup';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="LoginScreen"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Delivery" component={Delivery} />

          <Stack.Screen name="Orders" component={Orders} />

          <Stack.Screen name="Pickup" component={Pickup} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
