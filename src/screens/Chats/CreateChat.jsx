import React, { useEffect, useState, useLayoutEffect } from "react";
import { Text, View, Image, TouchableOpacity, TextInput, FlatList } from "react-native";

import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

// Styles
import styles from "./styles";
// Firebase
import { db, firebase, auth } from "../../firebase";

export default function CreateChatScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [value, setValue] = useState("");


  useEffect(() => {
    // Select other users
    const usersSnapshotUnsubscribe = db
      .collection("users")
      .where("userId", "!=", auth.currentUser?.uid)
      .onSnapshot((snapshot) => {
        setUsers(
          snapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
          })
        );
      });

    return () => {
      usersSnapshotUnsubscribe();
    };
  }, []);

    useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TextInput
          style={styles.input}
          placeholder="Пошук"
          onChangeText={(number) => setValue(number)}
          selectionColor="#000"
        />
      ),
    });
  });


  const createChat = async (userId) => {
    const fromMeId = auth.currentUser?.uid;
    const toMeId = userId;

    const fromMeInfo = (
      await db.collection("users").doc(fromMeId).get()
    ).data();
    const toMeInfo = (await db.collection("users").doc(toMeId).get()).data();

    const ref = await db.collection("chats_dev").add({
      group: false,
      groupMessage: "",
      groupName: "",
      groupPhoto: "",
      members: [fromMeId, toMeId],
      message: {
        [fromMeId]: "Привіт, розпочнемо спілкування😎",
        [toMeId]: "",
      },
      name: {
        [fromMeId]: fromMeInfo.name,
        [toMeId]: toMeInfo.name,
      },
      online: {
        [fromMeId]: fromMeInfo.online,
        [toMeId]: toMeInfo.online,
      },
      photo: {
        [fromMeId]: fromMeInfo.profilePhoto,
        [toMeId]: toMeInfo.profilePhoto,
      },
      timestamp: firebase.firestore.Timestamp.now(),
      unreadCount: 1,
    });

    await ref.collection("messages").add({
      message: "Привіт, розпочнемо спілкування😎",
      timestamp: firebase.firestore.Timestamp.now(),
      seen: false,
      userId: auth.currentUser?.uid,
    });

    navigation.replace("ChatHistory", { chatId: ref.id, userId: userId });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <FlatList
        data={users.filter((item) => item.name.substr(0, value.length) == value || item.phone.substr(0, value.length) == value)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chat}
            activeOpacity={0.5}
            onPress={() => createChat(item.userId)}
          >
            {item.profilePhoto != "" ? (
              <Image
                style={styles.chat_photo}
                source={{
                  uri: item.profilePhoto,
                }}
              />
            ) : (
              <View style={[styles.chat_photo, { backgroundColor: "#aaa" }]}>
                <Text style={{ fontSize: 24, color: "#fff" }}>
                  {item.name[0]}
                </Text>
              </View>
            )}

            {item.online === true ? (
              <View style={styles.chat_online}></View>
            ) : null}

            <View style={styles.chat_info}>
              <View style={styles.chat_name_date_status}>
                <Text style={styles.chat_name}>{item.name}</Text>
              </View>

              <Text style={styles.chat_message}>{item.phone}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
