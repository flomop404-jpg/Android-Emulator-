import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Screens
import HomeScreen from './screens/HomeScreen';
import EmulatorScreen from './screens/EmulatorScreen';
import SettingsScreen from './screens/SettingsScreen';
import ROMScreen from './screens/ROMScreen';
import AppsScreen from './screens/AppsScreen';
import TerminalScreen from './screens/TerminalScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function EmulatorStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Android Emulator Controller' }}
      />
      <Stack.Screen 
        name="Emulator" 
        component={EmulatorScreen}
        options={{ title: 'Emulator Control' }}
      />
      <Stack.Screen 
        name="Terminal" 
        component={TerminalScreen}
        options={{ title: 'Shell Commands' }}
      />
    </Stack.Navigator>
  );
}

function ROMStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ROMList" 
        component={ROMScreen}
        options={{ title: 'ROM Management' }}
      />
    </Stack.Navigator>
  );
}

function AppsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="AppsList" 
        component={AppsScreen}
        options={{ title: 'App Management' }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="SettingsList" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'EmulatorTab') {
                iconName = focused ? 'smartphone' : 'smartphone';
              } else if (route.name === 'ROMTab') {
                iconName = focused ? 'memory' : 'memory';
              } else if (route.name === 'AppsTab') {
                iconName = focused ? 'apps' : 'apps';
              } else if (route.name === 'SettingsTab') {
                iconName = focused ? 'settings' : 'settings';
              }

              return <MaterialIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#3B82F6',
            tabBarInactiveTintColor: '#6B7280',
            tabBarStyle: {
              backgroundColor: '#1F2937',
              borderTopColor: '#374151',
            },
          })}
        >
          <Tab.Screen 
            name="EmulatorTab" 
            component={EmulatorStack}
            options={{ title: 'Emulator' }}
          />
          <Tab.Screen 
            name="ROMTab" 
            component={ROMStack}
            options={{ title: 'ROM' }}
          />
          <Tab.Screen 
            name="AppsTab" 
            component={AppsStack}
            options={{ title: 'Apps' }}
          />
          <Tab.Screen 
            name="SettingsTab" 
            component={SettingsStack}
            options={{ title: 'Settings' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
    </>
  );
}
