import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  AppState,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

// Styles
import styles from "./styles";
// Firebase
import { db, firebase, auth } from "../../firebase";

export default function ChatsScreen({ navigation }) {
  const [chats, setChats] = useState();

  useEffect(() => {
    const unsubscribeSnapshot = db
      .collection("chats")
      .onSnapshot((querySnapshot) => {
        setChats(
          querySnapshot.docs.map((item) => {
            return { id: item.id, ...item.data() };
          })
        );
      });

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

    (async () => {
      // const chats = await db
      //   .collection("chats")
      //   .where("membersId", "array-contains", auth.currentUser?.uid)
      //   .get();
      // console.log(chats.docs.map((chat) => chat.data()));
      // await db
      //   .collection("chats")
      //   .doc("Klj95wUlYkwp6oHdTt6X")
      //   .collection("messages")
      //   .add({
      //     message: "Тест",
      //   });
      // console.log(chats.empty);
    })();

    return () => {
      unsubscribeSnapshot();
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  const handleAppStateChange = async (state) => {
    const user = await db
      .collection("users")
      .where("userId", "==", auth.currentUser.uid)
      .get();

    user.docs.forEach((user) => {
      user.ref.update({ online: state != "background" });
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
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chat}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("ChatHistory")}
          >
            <Image
              style={styles.chat_photo}
              source={{
                uri:
                  item.from_user?.profilePhoto != ""
                    ? item.from_user?.profilePhoto
                    : "https://habrastorage.org/r/w60/files/80c/815/1a4/80c8151a49e64eeda729744bca32116d.jpg",
              }}
            />

            {item.from_user?.online ? (
              <View style={styles.chat_online}></View>
            ) : null}

            <View style={styles.chat_info}>
              <View style={styles.chat_name_date_status}>
                <Text style={styles.chat_name}>{item.from_user?.name}</Text>

                <View style={styles.chat_date_status}>
                  <Ionicons name="checkmark-done" size={20} color="green" />
                  <Text style={styles.chat_date}>
                    {dateFormat(item.date?.seconds)}
                  </Text>
                </View>
              </View>

              <Text style={styles.chat_message} numberOfLines={2}>
                {item.message}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
