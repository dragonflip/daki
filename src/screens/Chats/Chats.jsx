import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  AppState,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import moment from "moment";

// Styles
import styles from "./styles";
// Firebase
import { db, firebase, auth } from "../../firebase";

export default function ChatsScreen({ navigation }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);

    let usersSnapshotUnsubscribe,
      messagesSnapshotUnsubscribe,
      unreadCountSnapshotUnsubscribe;

    let notifications = false;
    let lastMessageTimestamp = 0;

    // Select chats where I'm member
    const chatsSnapshotUnsubscribe = db
      .collection("chats")
      .where("members", "array-contains", auth.currentUser?.uid)
      .onSnapshot((chatsSnapshot) => {
        let allChats = {};

        chatsSnapshot.docs.forEach((chat) => {
          let chatData = {};

          const userId = chat
            .data()
            .members.filter((member) => member != auth.currentUser?.uid)[0];

          // Get chat user info
          usersSnapshotUnsubscribe = db
            .collection("users")
            .doc(userId)
            .onSnapshot((users) => {
              // Chat data
              if (users.exists) {
                chatData = {
                  ...chatData,
                  id: chat.id,
                  name: users.data().name,
                  photo: users.data().profilePhoto,
                  online: users.data().online === true,
                  userId: users.id,
                };

                allChats[chat.id] = chatData;
                setChats(
                  // Sort chats by last message timestamp
                  Object.values(allChats).sort(
                    (a, b) => b.timestamp?.seconds > a.timestamp?.seconds
                  )
                );
              }
            });

          // Get message
          messagesSnapshotUnsubscribe = db
            .collection("chats")
            .doc(chat.id)
            .collection("messages")
            .orderBy("timestamp", "desc")
            .limit(20) // Caching messages
            .onSnapshot((messages) => {
              // Chat data
              chatData = {
                ...chatData,
                id: chat.id,
                message: messages.docs[0].data().message,
                timestamp: messages.docs[0].data().timestamp,
                seen: messages.docs[0].data().seen,
                me: messages.docs[0].data().userId == auth.currentUser?.uid,
              };

              allChats[chat.id] = chatData;
              setChats(
                // Sort chats by last message timestamp
                Object.values(allChats).sort(
                  (a, b) => b.timestamp?.seconds > a.timestamp?.seconds
                )
              );

              // Vibrate if new message
              if (
                messages.docs[0].data().userId !== auth.currentUser?.uid &&
                messages.docs[0].data().seen === false &&
                messages.docs[0].data().timestamp.seconds >
                  lastMessageTimestamp &&
                notifications
              ) {
                Haptics.notificationAsync();
              } else {
                notifications = true;
              }

              lastMessageTimestamp = messages.docs[0].data().timestamp.seconds;
            });

          // Get unread messages count
          unreadCountSnapshotUnsubscribe = db
            .collection("chats")
            .doc(chat.id)
            .collection("messages")
            .where("userId", "!=", auth.currentUser?.uid)
            .where("seen", "==", false)
            .onSnapshot((unreadMessages) => {
              // Chat data
              chatData = {
                ...chatData,
                id: chat.id,
                unreadCount: unreadMessages.docs.length,
              };

              allChats[chat.id] = chatData;
              setChats(
                // Sort chats by last message timestamp
                Object.values(allChats).sort(
                  (a, b) => b.timestamp?.seconds > a.timestamp?.seconds
                )
              );

              // console.log(Object.values(allChats));
            });
        });
      });

    return () => {
      // TODO fix this try-catch
      try {
        chatsSnapshotUnsubscribe();
        usersSnapshotUnsubscribe();
        messagesSnapshotUnsubscribe();
        unreadCountSnapshotUnsubscribe();
      } catch {}

      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  const handleAppStateChange = async (state) => {
    await db
      .collection("users")
      .doc(auth.currentUser?.uid)
      .update({
        online:
          state != "background" ? true : firebase.firestore.Timestamp.now(),
      });
  };

  const dateFormat = (seconds) => {
    if (moment.unix(moment().unix()).isSame(moment.unix(seconds), "date")) {
      return moment.unix(seconds).format("HH:mm");
    } else {
      return moment.unix(seconds).format("DD.MM.YYYY");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {chats.length > 0 ? (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chat}
              activeOpacity={0.5}
              onPress={() =>
                navigation.navigate("ChatHistory", {
                  chatId: item.id,
                  userId: item.userId,
                })
              }
            >
              {item.photo != "" ? (
                <Image
                  style={styles.chat_photo}
                  source={{
                    uri: item.photo,
                  }}
                />
              ) : (
                <View style={[styles.chat_photo, { backgroundColor: "#aaa" }]}>
                  <Text style={{ fontSize: 24, color: "#fff" }}>
                    {item.name[0]}
                  </Text>
                </View>
              )}

              {item.online ? <View style={styles.chat_online}></View> : null}

              <View style={styles.chat_info}>
                <View style={styles.chat_name_date_status}>
                  <Text style={styles.chat_name}>{item.name}</Text>

                  <View style={styles.chat_date_status}>
                    {item.me && item.seen ? (
                      <Ionicons name="checkmark-done" size={20} color="green" />
                    ) : item.me ? (
                      <Ionicons name="checkmark" size={20} color="green" />
                    ) : null}

                    <Text style={styles.chat_date}>
                      {dateFormat(item.timestamp?.seconds)}
                    </Text>
                  </View>
                </View>

                <View style={styles.chat_message_unreadCount}>
                  <Text style={styles.chat_message} numberOfLines={2}>
                    {item.me ? (
                      <Text style={{ fontWeight: "bold" }}>Я: </Text>
                    ) : null}
                    {item.message}
                  </Text>
                  {item.unreadCount > 0 ? (
                    <View style={styles.chat_unreadCount}>
                      <Text style={styles.chat_unreadCountText}>
                        {item.unreadCount}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name="chat-outline" size={128} color="grey" />
          <Text style={{ color: "#000", fontSize: 20, fontWeight: "bold" }}>
            Немає чатів
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("CreateChat")}>
            <Text style={{ color: "blue" }}>Створити</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
