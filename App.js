import React from "react";
import { Ionicons } from "@expo/vector-icons";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
import AuthScreen from "./screens/Auth";
import ChatsScreen from "./screens/Chats";
import SettingsScreen from "./screens/Settings";

// Navigation tabs
function NavigationTabs() {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },

        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "grey",
      }}
    >
      <Tab.Screen
        name="Чати"
        component={ChatsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Налаштування"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main App
function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={AuthScreen} />
        <Stack.Screen
          name="Home"
          component={NavigationTabs}
          options={{ header: () => null }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
