import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Entypo, AntDesign } from "@expo/vector-icons";

// Styles
import styles from "./styles";
// Firebase
import { db, firebase, auth } from "../../firebase";

export default function CreateChatScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [value, setValue] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const selectedUsersRef = useRef([]);
  const selectedUsersCount = useRef(0);

  // Navigation
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () =>
        Platform.OS === "android" ? (
          <TextInput
            style={{
              fontSize: 18,
              width: Dimensions.get("screen").width - 140,
              textAlign: Platform.OS === "ios" ? "center" : null,
            }}
            placeholder="Пошук"
            onChangeText={setValue}
            selectionColor="#000"
          />
        ) : null,
      headerSearchBarOptions: {
        placeholder: "Пошук",
        hideWhenScrolling: false,
        onChangeText: (event) => setValue(event.nativeEvent.text),
      },
    });
  });

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

  const createChat = async (userId) => {
    const fromMeId = auth.currentUser?.uid;
    const toMeId = userId;

    const fromMeInfo = (
      await db.collection("users").doc(fromMeId).get()
    ).data();
    const toMeInfo = (await db.collection("users").doc(toMeId).get()).data();

    if (selectedUsersCount.current > 1) {
      // Group
      const newChatRef = await db.collection("chats").add({
        group: true,
        adminId: fromMeId,
        groupMessage: "Привіт, розпочнемо спілкування😎",
        groupMessageSenderId: fromMeId,
        groupMessageSenderName: fromMeInfo.name,
        groupName: `Група №${firebase.firestore.Timestamp.now().seconds}`,
        groupPhoto:
          "https://firebasestorage.googleapis.com/v0/b/daki-messenger.appspot.com/o/photo_2019-08-31_10-12-35.jpg?alt=media&token=16ab1801-45c1-43e4-9b75-732bd78b12f7",
        members: [fromMeId, ...selectedUsersRef.current],
        timestamp: firebase.firestore.Timestamp.now(),
        unreadCount: Object.fromEntries(
          [fromMeId, ...selectedUsersRef.current].map((id) => [id, 1])
        ),
      });

      // Send message
      await newChatRef.collection("messages").add({
        message: "Привіт, розпочнемо спілкування😎",
        timestamp: firebase.firestore.Timestamp.now(),
        seen: false,
        userId: auth.currentUser?.uid,
        userName: fromMeInfo.name,
      });

      // Add members info
      for (const userId of [fromMeId, ...selectedUsersRef.current]) {
        const userInfo = await db.collection("users").doc(userId).get();

        await newChatRef
          .collection("members")
          .doc(userId)
          .set({
            ...userInfo.data(),
            admin: userId === fromMeId,
          });
      }

      navigation.replace("ChatsMessages", {
        chatId: newChatRef.id,
        userId: newChatRef.id,
      });
    } else {
      // Dialog
      const chatsRef = await db
        .collection("chats")
        .where("group", "==", false)
        .where("members", "array-contains", fromMeId)
        .get();

      const chatExists = chatsRef.docs.filter(
        (chat) =>
          chat.data().members.filter((member) => member === toMeId).length > 0
      );

      if (!chatExists.length) {
        const newChatRef = await db.collection("chats").add({
          group: false,
          members: [fromMeId, toMeId],
          blocked: {
            [fromMeId]: false,
            [toMeId]: false,
          },
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
          typing: {
            [fromMeId]: false,
            [toMeId]: false,
          },
          unreadCount: 1,
        });

        await newChatRef.collection("messages").add({
          message: "Привіт, розпочнемо спілкування😎",
          timestamp: firebase.firestore.Timestamp.now(),
          seen: false,
          userId: auth.currentUser?.uid,
        });

        navigation.replace("ChatsMessages", {
          chatId: newChatRef.id,
          userId: userId,
        });
      } else {
        navigation.replace("ChatsMessages", {
          chatId: chatExists[0].id,
          userId: userId,
        });
      }
    }
  };

  // Select users in list
  const selectUser = (userId) => {
    if (!selectedUsers.includes(userId)) {
      const newValue = [...selectedUsers, userId];

      setSelectedUsers(newValue);
      selectedUsersRef.current = newValue;
      selectedUsersCount.current++;
    } else {
      const newValue = selectedUsers.filter((user) => user != userId);

      setSelectedUsers(newValue);
      selectedUsersRef.current = newValue;
      selectedUsersCount.current--;
    }

    if (selectedUsersCount.current > 0) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => createChat(userId)}>
            <AntDesign name="check" size={24} color="#000" />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: null,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <FlatList
        data={users.filter(
          (item) =>
            item.name.substr(0, value.length) == value ||
            item.phone.substr(0, value.length) == value
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chat}
            activeOpacity={0.5}
            onPress={() => selectUser(item.userId)}
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

            {selectedUsers.filter((user) => user === item.userId).length > 0 ? (
              <View
                style={{
                  position: "absolute",
                  top: 45,
                  left: 45,
                  backgroundColor: "green",
                  width: 20,
                  height: 20,
                  borderRadius: 20,
                }}
              >
                <Entypo name="check" size={20} color="#fff" />
              </View>
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
