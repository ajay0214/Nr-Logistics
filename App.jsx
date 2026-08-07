import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { ThemeProvider } from './components/ThemeContext';
import globalurl from './reducers/globalurl';

import LoginScreen from './pages/Loginscreen';
import BottomTab from './pages/BottomTab';
import HomeLayout from './pages/HomeLayout';
import OrderDetails from './pages/OrderDetails';

const Stack = createNativeStackNavigator();

export const store = configureStore({
  reducer: {
    globalurl,
  },
});

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="LoginScreen"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="BottomTab" component={BottomTab} />
            <Stack.Screen name="HomeLayout" component={HomeLayout} />
            <Stack.Screen name="OrderDetails" component={OrderDetails} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
