import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  AppState,
  Platform,
  Alert,
  ActivityIndicator,
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
  const [loading, setLoading] = useState(true);

  // Navigation
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () =>
        Platform.OS === "ios" ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateChat")}
            style={{ marginLeft: 12 }}
          >
            <MaterialCommunityIcons
              name="chat-plus-outline"
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        ) : null,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Search")}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="search" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  });

  // Init
  useEffect(() => {
    // Update online
    AppState.addEventListener("change", handleAppStateChange);
    handleAppStateChange("active");

    // const onlineUpdater = setInterval(() => {
    //   handleAppStateChange("active");
    // }, 10000);

    let lastMessageTimestamp = 0;
    // let onlineChecker;

    // Select chats where I'm member
    const chatsSnapshotUnsubscribe = db
      .collection("chats_dev")
      .where("members", "array-contains", auth.currentUser?.uid)
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          const allChats = snapshot.docs.map((chat) => {
            const fromMeId = auth.currentUser?.uid;
            const toMeId = chat
              .data()
              .members.filter((member) => member != fromMeId)[0];

            return {
              id: chat.id,
              userId: toMeId,
              name: chat.data().name[toMeId],
              photo: chat.data().photo[toMeId],
              message:
                chat.data().message[toMeId] || chat.data().message[fromMeId],
              me: chat.data().message[fromMeId] != "",
              online: chat.data().online[toMeId],
              timestamp: chat.data().timestamp,
              unreadCount: chat.data().unreadCount,
              seen: chat.data().unreadCount === 0,
            };
          });
          setChats(allChats);
          setLoading(false);

          // Vibrate if new message
          if (
            !allChats[0].me &&
            allChats[0].timestamp.seconds > lastMessageTimestamp
          ) {
            Haptics.notificationAsync();
          }
          lastMessageTimestamp = allChats[0].timestamp.seconds;
        } else {
          // Chat list is empty
          setChats({});
        }
      });

    return () => {
      chatsSnapshotUnsubscribe();

      // TODO without intervals in all screens
      // clearInterval(onlineChecker);
      // clearInterval(onlineUpdater);

      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  const handleAppStateChange = async (state) => {
    if (state !== "inactive") {
      // Update online status in users
      await db
        .collection("users")
        .doc(auth.currentUser?.uid)
        .update({
          online:
            state != "background"
              ? firebase.firestore.Timestamp.fromMillis(
                  (firebase.firestore.Timestamp.now().seconds + 60) * 1000
                )
              : firebase.firestore.Timestamp.now(),
        });

      // Update online status in chats
      db.collection("chats_dev")
        .where("members", "array-contains", auth.currentUser?.uid)
        .orderBy("timestamp", "desc")
        .get()
        .then((chats) => {
          chats.docs.forEach(async (chat) => {
            const fromMeId = auth.currentUser?.uid;
            const toMeId = chat
              .data()
              .members.filter((member) => member != fromMeId)[0];

            await chat.ref.update({
              online: {
                [fromMeId]:
                  state != "background"
                    ? firebase.firestore.Timestamp.fromMillis(
                        (firebase.firestore.Timestamp.now().seconds + 60) * 1000
                      )
                    : firebase.firestore.Timestamp.now(),
                [toMeId]: chat.data().online[toMeId],
              },
            });
          });
        });
    }
  };

  const dateFormat = (seconds) => {
    if (moment.unix(moment().unix()).isSame(moment.unix(seconds), "date")) {
      return moment.unix(seconds).format("HH:mm");
    } else {
      return moment.unix(seconds).format("DD.MM.YYYY");
    }
  };

  // Delete chat
  const deleteChat = (chatId) => {
    Haptics.selectionAsync();

    Alert.alert("Видалити чат?", "Чат буде видалено для всіх", [
      {
        text: "Скасувати",
        style: "cancel",
      },
      {
        text: "Видалити",
        style: "destructive",
        onPress: () => {
          db.collection("chats_dev")
            .doc(chatId)
            .collection("messages")
            .get()
            .then(async (messages) => {
              for (const message of messages.docs) {
                await message.ref.delete();
              }

              await db.collection("chats_dev").doc(chatId).delete();
            });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {Platform.OS === "android" && chats.length > 0 ? (
        <TouchableOpacity
          style={{
            width: 64,
            height: 64,
            borderRadius: 64,
            backgroundColor: "#000",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          activeOpacity={0.5}
          onPress={() => navigation.navigate("CreateChat")}
        >
          <MaterialCommunityIcons name="chat-plus" size={32} color="#fff" />
        </TouchableOpacity>
      ) : null}

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
              onLongPress={() => deleteChat(item.id)}
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

              {item.online?.seconds >
              firebase.firestore.Timestamp.now().seconds + 10 ? (
                <View style={styles.chat_online}></View>
              ) : null}

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
                  {item.unreadCount > 0 && !item.me ? (
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
      ) : loading ? (
        <ActivityIndicator
          color="#000"
          style={{ flex: 1 }}
          size={Platform.OS === "android" ? "large" : "small"}
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
