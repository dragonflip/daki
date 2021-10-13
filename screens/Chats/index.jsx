import React from "react";
import { Text, View, Image } from "react-native";

import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

// Styles
import styles from "./styles";

export default function ChatsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.chat}>
        <Image
          style={styles.chat_photo}
          source={{
            uri: "https://habrastorage.org/r/w60/files/80c/815/1a4/80c8151a49e64eeda729744bca32116d.jpg",
          }}
        />

        <View style={styles.chat_info}>
          <View style={styles.chat_name_date_status}>
            <Text style={styles.chat_name}>Святік</Text>

            <View style={styles.chat_date_status}>
              <Ionicons name="md-checkmark-done" size={20} color="green" />
              <Text style={styles.chat_date}>14:31</Text>
            </View>
          </View>

          <View style={styles.chat_preview}>
            <Text style={styles.chat_message} numberOfLines={2}>
              Шо ти мужик, я бтв зайшов в Яринку, а там продають приколи по 5
              грн
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
