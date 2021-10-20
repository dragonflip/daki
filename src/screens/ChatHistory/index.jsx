import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db, auth } from "../../firebase";

export default function ChatHistoryScreen({ navigation, route }) {
  const [message, setMessage] = useState("");

  // Get data from storage
  useEffect(() => {
    console.log(route.params.chatId);
  }, []);

  const sendMessage = async () => {
    db.collection("chats").doc(route.params.chatId).collection("messages").add({
      message: message,
      timestamp: firebase.firestore.Timestamp.now(),
      userId: auth.currentUser?.uid,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "column-reverse",
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              backgroundColor: "#eee",
              alignSelf: "flex-start",

              paddingLeft: 16,
              paddingRight: 8,
              paddingVertical: 8,
              marginHorizontal: 16,
              marginVertical: 2,

              borderTopRightRadius: 16,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,

              alignItems: "flex-end",
              flexDirection: "row",
            }}
          >
            <Text style={{ color: "black" }}>Дякую знаю</Text>
            <Text
              style={{
                color: "#aaa",
                fontSize: 10,
                marginLeft: 12,
                marginRight: 1,
              }}
            >
              14:27
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "black",
              alignSelf: "flex-end",

              paddingLeft: 16,
              paddingRight: 8,
              paddingVertical: 8,
              marginHorizontal: 16,
              marginVertical: 2,

              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,

              alignItems: "flex-end",
              flexDirection: "row",
            }}
          >
            <Text style={{ color: "white" }}>Ого мужик, ну ти крутий</Text>
            <Text
              style={{
                color: "#aaa",
                fontSize: 10,
                marginLeft: 12,
                marginRight: 1,
              }}
            >
              14:25
            </Text>
            <Ionicons
              name="checkmark-done"
              size={16}
              color="#aaa"
              style={{ alignSelf: "flex-end", height: 15 }}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TextInput
            style={{
              borderColor: "#eee",
              borderWidth: 2,
              borderRadius: 44,
              height: 44,
              paddingHorizontal: 16,
              marginHorizontal: 16,
              flex: 1,
            }}
            placeholder="Повідомлення..."
            onChangeText={setMessage}
          />
          <TouchableOpacity style={{ marginRight: 16 }} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
