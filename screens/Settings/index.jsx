import React from "react";
import { Text, View } from "react-native";

import { StatusBar } from "expo-status-bar";

// Styles
import styles from "./styles";

export default function ChatsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text>Налаштування</Text>
    </View>
  );
}
