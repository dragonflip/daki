import React from "react";
import * as expo from "expo";
import { Ionicons } from "@expo/vector-icons";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
import {
  AuthPhoneScreen,
  AuthCodeScreen,
  AuthWelcomeScreen,
} from "./screens/Auth";
import {
  ChatsScreen,
  ChatsCreateScreen,
  ChatsMessagesScreen,
  ChatsUserInfoScreen,
  ChatsGroupInfoScreen,
} from "./screens/Chats";
import { MyProfileScreen, MyProfileEditScreen } from "./screens/MyProfile";

// Main App
function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Phone">
        <Stack.Screen
          name="AuthPhone"
          component={AuthPhoneScreen}
          options={{
            headerShadowVisible: false,
            headerTitle: "",
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="AuthCode"
          component={AuthCodeScreen}
          options={{
            headerShadowVisible: false,
            headerTitle: "",
            headerTransparent: true,
            headerBackTitle: "Назад",
          }}
        />
        <Stack.Screen
          name="AuthWelcome"
          component={AuthWelcomeScreen}
          options={{
            headerShadowVisible: false,
            headerTitle: "",
            headerTransparent: true,
            headerBackTitle: "Назад",
          }}
        />

        <Stack.Screen
          name="Main"
          component={NavigationTabs}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="ChatsMessages"
          component={ChatsMessagesScreen}
          options={{
            headerBackTitle: "Чати",
          }}
        />
        <Stack.Screen
          name="ChatsCreate"
          component={ChatsCreateScreen}
          options={{
            headerBackTitle: "Чати",
            title: "Новий чат",
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen name="ChatsUserInfo" component={ChatsUserInfoScreen} />
        <Stack.Screen name="ChatsGroupInfo" component={ChatsGroupInfoScreen} />

        <Stack.Screen name="MyProfileEdit" component={MyProfileEditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

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

        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "grey",
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={24}
              color={color}
            />
          ),
          title: "Чати",
        }}
      />
      <Tab.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
          headerTransparent: true,
          headerTitle: "",
          title: "Мій профіль",
        }}
      />
    </Tab.Navigator>
  );
}

expo.registerRootComponent(App);
