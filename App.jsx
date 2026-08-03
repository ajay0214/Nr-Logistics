import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './components/ThemeContext';
import LoginScreen from './pages/Loginscreen';
import Dashboard from './pages/Dashboard';
import Delivery from './pages/Delivery';
import Orders from './pages/Orders';
import Pickup from './pages/Pickup';
import Profile from './pages/Profile';
import OrderDetails from './pages/OrderDetails';
import HomeLayout from './pages/HomeLayout';
import BottomTab from './pages/BottomTab';

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

          <Stack.Screen name="BottomTab" component={BottomTab} />

          <Stack.Screen name="HomeLayout" component={HomeLayout} />

          <Stack.Screen name="OrderDetails" component={OrderDetails} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
