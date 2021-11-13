import React from "react";
import * as expo from "expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

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
            headerTitle: "",
            headerTransparent: true,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="AuthCode"
          component={AuthCodeScreen}
          options={{
            headerTitle: "",
            headerTransparent: true,
            headerShadowVisible: false,
            headerBackTitle: "Назад",
          }}
        />
        <Stack.Screen
          name="AuthWelcome"
          component={AuthWelcomeScreen}
          options={{
            headerTitle: "",
            headerTransparent: true,
            headerShadowVisible: false,
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
            title: "Новий чат",
            headerLargeTitle: true,
            headerBackTitle: "Чати",
          }}
        />
        <Stack.Screen
          name="ChatsUserInfo"
          component={ChatsUserInfoScreen}
          options={{
            headerTitle: "",
            headerTransparent: true,
            headerShadowVisible: false,
            headerBackTitle: "Назад",
          }}
        />
        <Stack.Screen
          name="ChatsGroupInfo"
          component={ChatsGroupInfoScreen}
          options={{
            headerTitle: "",
            headerTransparent: true,
            headerShadowVisible: false,
            headerBackTitle: "Назад",
          }}
        />

        <Stack.Screen
          name="MyProfileEdit"
          component={MyProfileEditScreen}
          options={{
            presentation: "fullScreenModal",
            headerTitle: "",
            headerTransparent: true,
            headerShadowVisible: false,
            headerBackTitle: "Мій профіль",
            // gestureEnabled: false,
          }}
        />
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
              size={28}
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
            <MaterialCommunityIcons
              name={focused ? "account-circle" : "account-circle-outline"}
              size={28}
              color={color}
            />
          ),
          title: "Мій профіль",
          headerTitle: "",
          headerTransparent: true,
          headerShadowVisible: false,
        }}
      />
    </Tab.Navigator>
  );
}

expo.registerRootComponent(App);
