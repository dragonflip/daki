import React from "react";
import { Text, View, Image, Platform, TouchableOpacity } from "react-native";
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
import ChatsScreen from "./screens/Chats";
import ChatHistoryScreen from "./screens/ChatHistory";
import SettingsScreen from "./screens/Settings";

// Main App
function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Phone"
        // screenOptions={{
        //   headerShown: false,
        // }}
      >
        <Stack.Screen
          name="Phone"
          component={AuthPhoneScreen}
          options={{
            headerShadowVisible: false,
            headerTitle: "",
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="Code"
          component={AuthCodeScreen}
          options={{
            headerShadowVisible: false,
            headerTitle: "",
            headerTransparent: true,
            headerBackTitle: "Назад",
          }}
        />
        <Stack.Screen
          name="Welcome"
          component={AuthWelcomeScreen}
          options={{
            headerShadowVisible: false,
            headerTitle: "",
            headerTransparent: true,
            headerBackTitle: "Назад",
          }}
        />
        <Stack.Screen
          name="Home"
          component={NavigationTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatHistory"
          component={ChatHistoryScreen}
          options={{
            headerBackTitle: "Чати",
            headerTitle: () =>
              Platform.OS === "ios" ? (
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    Святік
                  </Text>
                  <Text style={{ fontSize: 12, color: "green" }}>онлайн</Text>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -8,
                  }}
                >
                  <Image
                    style={{
                      backgroundColor: "#aaa",
                      width: 42,
                      height: 42,
                      borderRadius: 42,
                      marginRight: 12,
                    }}
                    source={{
                      uri: "https://habrastorage.org/r/w60/files/80c/815/1a4/80c8151a49e64eeda729744bca32116d.jpg",
                    }}
                  />
                  <View style={{ flexDirection: "column" }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      Святік
                    </Text>
                    <Text style={{ fontSize: 12, color: "green" }}>онлайн</Text>
                  </View>
                </View>
              ),
            headerRight: () =>
              Platform.OS === "ios" ? (
                <Image
                  style={{
                    backgroundColor: "#aaa",
                    width: 32,
                    height: 32,
                    borderRadius: 32,
                    marginRight: -8,
                  }}
                  source={{
                    uri: "https://habrastorage.org/r/w60/files/80c/815/1a4/80c8151a49e64eeda729744bca32116d.jpg",
                  }}
                />
              ) : (
                <TouchableOpacity>
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={24}
                    color="black"
                  />
                </TouchableOpacity>
              ),
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

        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "grey",
        tabBarHideOnKeyboard: true,
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
          headerTransparent: true,
          headerTitle: "",
        }}
      />
    </Tab.Navigator>
  );
}

expo.registerRootComponent(App);
