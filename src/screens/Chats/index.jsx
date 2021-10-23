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
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

// Styles
import styles from "./styles";
// Firebase
import { db, firebase, auth } from "../../firebase";

export default function ChatsScreen({ navigation }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);

    // db.collection("chats").add({
    //   from_user: {
    //     name: "Святік",
    //     user_id: 22,
    //     online: true,
    //     profilePhoto: "",
    //   },
    //   to_user: {
    //     name: "Вадік",
    //     user_id: 33,
    //     online: false,
    //     profilePhoto: "",
    //   },
    //   message: "Це получаєця тест",
    //   date: firebase.firestore.Timestamp.now(),
    //   has_read: true,
    // });

    // db.collection("chats").add({
    //   group: false,
    //   groupName: "",
    //   groupPhoto: "",
    //   membersId: [auth.currentUser?.uid, 22],
    //   members: [
    //     {
    //       userId: auth.currentUser?.uid,
    //       name: "Вадік",
    //       online: false,
    //       profilePhoto: "",
    //     },
    //     {
    //       userId: 22,
    //       name: "Святік",
    //       online: true,
    //       profilePhoto: "",
    //     },
    //   ],
    //   messages: [
    //     {
    //       messageId: db.collection("chats").doc().id,
    //       userId: auth.currentUser?.uid,
    //       message: "Ого, а це чат",
    //       hasRead: true,
    //       date: firebase.firestore.Timestamp.now(),
    //     },
    //     {
    //       messageId: db.collection("chats").doc().id,
    //       userId: 22,
    //       message: "Та да, получаєця шо чат",
    //       hasRead: false,
    //       date: firebase.firestore.Timestamp.now(),
    //     },
    //   ],
    // });

    // Create chat
    // db.collection("chats")
    //   .add({
    //     group: false,
    //     groupName: "",
    //     groupPhoto: "",
    //     timestamp: "",
    //   })
    //   .then((doc) => {
    //     // Write message to chat
    //     db.collection("chats").doc(doc.id).collection("messages").add({
    //       userId: 333,
    //       message: "Дуже круте",
    //       timestamp: firebase.firestore.Timestamp.now(),
    //     });

    //     // Add member to chat group
    //     db.collection("chats").doc(doc.id).collection("members").add({
    //       userId: 333,
    //       name: "Вадік",
    //       timestamp: firebase.firestore.Timestamp.now(),
    //     });
    //   });

    let membersSnapshotUnsubscribe,
      usersSnapshotUnsubscribe,
      messagesSnapshotUnsubscribe;
    const chatsSnapshotUnsubscribe = db
      .collection("chats")
      .onSnapshot((chatsSnapshot) => {
        let allChats = {};

        chatsSnapshot.docs.forEach((chat) => {
          let chatData = {};

          // Get member
          membersSnapshotUnsubscribe = db
            .collection("chats")
            .doc(chat.id)
            .collection("members")
            .where("userId", "!=", auth.currentUser?.uid)
            .limit(1)
            .onSnapshot((members) => {
              usersSnapshotUnsubscribe = db
                .collection("users")
                .doc(members.docs[0].data().userId)
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
                    setChats(Object.values(allChats));
                  }
                });
            });

          // Get message
          messagesSnapshotUnsubscribe = db
            .collection("chats")
            .doc(chat.id)
            .collection("messages")
            .orderBy("timestamp", "desc")
            .limit(1)
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
              setChats(Object.values(allChats));

              // console.log(Object.values(allChats));
            });
        });

        // setChats(allChats);
        // console.log(allChats);
      });

    // Get name and photo
    // db.collection("chats")
    //   .doc("HY2T1KEhlOoOhZHhsIwl")
    //   .collection("members")
    //   .where("userId", "!=", auth.currentUser?.uid)
    //   .limit(1)
    //   .onSnapshot((snapshot) => {
    //     // console.log(snapshot.docs[0].data());
    //     setChats([
    //       {
    //         ...chats,
    //         name: snapshot.docs[0].data().name,
    //         profilePhoto: "",
    //       },
    //     ]);
    //   });

    // Get last message and date
    // db.collection("chats")
    //   .doc("HY2T1KEhlOoOhZHhsIwl")
    //   .collection("messages")
    //   .orderBy("timestamp", "desc")
    //   .limit(1)
    //   .onSnapshot((snapshot) => {
    //     console.log(snapshot.docs[0].data());
    //     chat.message = snapshot.docs[0].data().message;
    //     chat.timestamp = snapshot.docs[0].data().timestamp;
    //   });

    // (async () => {
    // const chats = await db.collection("chats").get();
    // console.log(chats.docs.map((chat) => chat.data()));

    // chats.docs.forEach(async (chat) => {
    // db
    //   .collection("chats")
    //   .doc(chat.id)
    //   .collection("messages")
    //   .orderBy("timestamp", "desc")
    //   .limit(1)
    //   .onSnapshot((snapshot) => {
    //     console.log(snapshot.docs[0].data());
    //   });
    // console.log(messages.docs.map((chat) => chat.data()));
    // });
    // await db
    //   .collection("chats")
    //   .doc("Klj95wUlYkwp6oHdTt6X")
    //   .collection("messages")
    //   .add({
    //     message: "Тест",
    //   });
    // console.log(chats.empty);
    // })();

    return () => {
      chatsSnapshotUnsubscribe();
      membersSnapshotUnsubscribe();
      usersSnapshotUnsubscribe();
      messagesSnapshotUnsubscribe();

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
    if (
      moment.unix(moment().unix()).format("DD.MM.YYYY") !=
      moment.unix(seconds).format("DD.MM.YYYY")
    ) {
      return moment.unix(seconds).format("DD.MM.YYYY");
    } else {
      return moment.unix(seconds).format("HH:mm");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chat}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("ChatHistory", {
                chatId: item.id,
                userId: item.userId,
              })
            }
          >
            <Image
              style={styles.chat_photo}
              source={{
                uri: item.photo,
              }}
            />

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

              <Text style={styles.chat_message} numberOfLines={2}>
                {item.me ? (
                  <Text style={{ fontWeight: "bold" }}>Я: </Text>
                ) : null}
                {item.message}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
