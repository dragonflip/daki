import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Moment from "react-moment";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db, auth } from "../../firebase";

export default function ChatHistoryScreen({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const input = useRef();

  // Change header
  useLayoutEffect(() => {});

  // Init
  useEffect(() => {
    // Get member
    // TODO chat group info
    const memberSnapshotUnsubscribe = db
      .collection("chats")
      .doc(route.params.chatId)
      .collection("members")
      .where("userId", "!=", auth.currentUser?.uid)
      .limit(1)
      .onSnapshot((snapshot) => {
        const chatInfo = snapshot.docs.map((doc) => doc.data())[0];

        navigation.setOptions({
          headerTitle: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
              {Platform.OS === "ios" ? (
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {chatInfo.name}
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
                      uri: chatInfo.photo,
                    }}
                  />
                  <View style={{ flexDirection: "column" }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {chatInfo.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "green" }}>онлайн</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ),
        });
      });

    // Update message seen
    // TODO inside snapshot
    db.collection("chats")
      .doc(route.params.chatId)
      .collection("messages")
      .where("userId", "!=", auth.currentUser?.uid)
      .get()
      .then((messages) => {
        messages.docs.forEach((message) => {
          message.ref.update({ seen: true });
        });
      });

    // Get messages
    const messagesSnapshotUnsubscribe = db
      .collection("chats")
      .doc(route.params.chatId)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => {
            return {
              id: doc.id,
              me: doc.data().userId == auth.currentUser?.uid,
              ...doc.data(),
            };
          })
        );
      });

    return () => {
      memberSnapshotUnsubscribe();
      messagesSnapshotUnsubscribe();
    };
  }, []);

  // Send message
  const sendMessage = () => {
    db.collection("chats").doc(route.params.chatId).collection("messages").add({
      message: inputMessage,
      timestamp: firebase.firestore.Timestamp.now(),
      userId: auth.currentUser?.uid,
    });

    setInputMessage("");
    input.current.clear();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            flex: 1,
            flexDirection: "column-reverse",
            paddingBottom: 8,
          }}
          renderItem={({ item }) => (
            <View style={item.me ? styles.messageFromMe : styles.messageToMe}>
              <Text
                style={
                  item.me ? styles.messageTextFromMe : styles.messageTextToMe
                }
              >
                {item.message}
              </Text>
              <Text style={styles.messageTime}>
                <Moment element={Text} unix format="HH:mm">
                  {item.timestamp}
                </Moment>
              </Text>

              {item.me && item.seen ? (
                <Ionicons
                  name="checkmark-done"
                  size={16}
                  color="#aaa"
                  style={{ alignSelf: "flex-end", height: 15 }}
                />
              ) : item.me ? (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color="#aaa"
                  style={{ alignSelf: "flex-end", height: 15 }}
                />
              ) : null}
            </View>
          )}
        ></FlatList>

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
            onChangeText={setInputMessage}
            ref={input}
          />
          <TouchableOpacity style={{ marginRight: 16 }} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
