import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  AppState,
  Alert,
  Dimensions,
  ImageBackground,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import moment from "moment";
import Moment from "react-moment";

// Styles
import styles from "./styles";
import colors from "../../styles/colors";
// Firebase
import { db, firebase, auth } from "../../firebase";
// Components
import LoadingScreen from "../../components/LoadingScreen";

export default function ChatsScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Init
  useEffect(() => {
    // Update online
    AppState.addEventListener("change", handleAppStateChange);
    handleAppStateChange("active");

    const onlineUpdater = setInterval(() => {
      handleAppStateChange("active");
    }, 30000);

    let lastMessageTimestamp = 0;

    // Select chats where I'm member
    const chatsSnapshotUnsubscribe = db
      .collection("chats")
      .where("members", "array-contains", auth.currentUser?.uid)
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          // All chats
          const allChats = snapshot.docs.map((chat) => {
            const fromMeId = auth.currentUser?.uid;
            const toMeId = chat
              .data()
              .members.filter((member) => member !== fromMeId)[0];

            if (chat.data().group) {
              // Group
              return {
                id: chat.id,
                userId: chat.id,
                group: true,
                name: chat.data().groupName,
                photo: chat.data().groupPhoto,

                message: chat.data().groupMessage,
                messageSenderId: chat.data().groupMessageSenderId,
                messageSenderName: chat.data().groupMessageSenderName,
                systemMessage: chat.data().groupSystemMessage,

                me: chat.data().groupMessageSenderId === fromMeId,
                admin: chat.data().adminId === fromMeId,
                verified: chat.data().groupVerified,

                timestamp: chat.data().timestamp,
                unreadCount: chat.data().unreadCount[fromMeId],
                seen:
                  Object.keys(chat.data().unreadCount).filter(
                    (id) => id !== fromMeId && chat.data().unreadCount[id] === 0
                  ).length > 0,
              };
            } else {
              // Dialog
              return {
                id: chat.id,
                userId: toMeId,
                name: chat.data().name[toMeId],
                photo: chat.data().photo[toMeId],

                message:
                  chat.data().message[toMeId] || chat.data().message[fromMeId],
                me: chat.data().message[fromMeId] !== "",
                online: chat.data().online[toMeId],
                verified: chat.data().verified?.[toMeId] || false,

                timestamp: chat.data().timestamp,
                unreadCount: chat.data().unreadCount,
                seen: chat.data().unreadCount === 0,
              };
            }
          });
          setChats(allChats);
          setLoading(false);

          // Vibrate if new message
          if (
            !allChats[0].me &&
            allChats[0].unreadCount > 0 &&
            allChats[0].timestamp.seconds > lastMessageTimestamp &&
            lastMessageTimestamp > 0
          ) {
            Haptics.notificationAsync();
          }
          lastMessageTimestamp = allChats[0].timestamp.seconds;

          // Count unread chats
          const unreadCount = snapshot.docs.filter(
            (doc) =>
              doc.data().unreadCount[auth.currentUser?.uid] > 0 ||
              (doc.data().unreadCount > 0 &&
                doc.data().message[auth.currentUser?.uid] === "")
          ).length;

          navigation.setOptions({
            tabBarBadge: unreadCount > 0 ? unreadCount : null,
          });
        } else {
          // Chat list is empty
          setChats({});
          setLoading(false);
        }
      });

    return () => {
      chatsSnapshotUnsubscribe();

      clearInterval(onlineUpdater);
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  // Handle app state
  const handleAppStateChange = async (state) => {
    if (state !== "inactive") {
      // Update online status in users
      await db
        .collection("users")
        .doc(auth.currentUser?.uid)
        .update({
          online:
            state !== "background"
              ? firebase.firestore.Timestamp.fromMillis(
                  (firebase.firestore.Timestamp.now().seconds + 60) * 1000
                )
              : firebase.firestore.Timestamp.now(),
        });

      // Update online status in chats
      const chats = await db
        .collection("chats")
        .where("members", "array-contains", auth.currentUser?.uid)
        .orderBy("timestamp", "desc")
        .get();

      for (const chat of chats.docs) {
        if (chat.data().group) {
          // Group
          await chat.ref
            .collection("members")
            .doc(auth.currentUser?.uid)
            .update({
              online:
                state !== "background"
                  ? firebase.firestore.Timestamp.fromMillis(
                      (firebase.firestore.Timestamp.now().seconds + 60) * 1000
                    )
                  : firebase.firestore.Timestamp.now(),
            });
        } else {
          // Dialog
          await chat.ref.update({
            [`online.${auth.currentUser?.uid}`]:
              state !== "background"
                ? firebase.firestore.Timestamp.fromMillis(
                    (firebase.firestore.Timestamp.now().seconds + 60) * 1000
                  )
                : firebase.firestore.Timestamp.now(),
          });
        }
      }
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
        onPress: async () => {
          setLoading(true);

          // Delete messages
          const messages = await db
            .collection("chats")
            .doc(chatId)
            .collection("messages")
            .get();

          for (const message of messages.docs) {
            await message.ref.delete();
          }

          // Delete members
          const members = await db
            .collection("chats")
            .doc(chatId)
            .collection("members")
            .get();

          for (const member of members.docs) {
            await member.ref.delete();
          }

          // Delete chat
          await db.collection("chats").doc(chatId).delete();

          setLoading(false);
        },
      },
    ]);
  };

  // Leave group
  const leaveGroup = async (groupId) => {
    Alert.alert(
      "Покинути групу?",
      "Ваші повідомлення залишаться, і Ви зможете повторно приєднатись, якщо Вас хтось додасть",
      [
        {
          text: "Скасувати",
          style: "cancel",
        },
        {
          text: "Покинути",
          style: "destructive",
          onPress: async () => {
            setLoading(true);

            // Delete from members collection
            await db
              .collection("chats")
              .doc(groupId)
              .collection("members")
              .doc(auth.currentUser?.uid)
              .delete();

            // Delete from members chat array
            await db
              .collection("chats")
              .doc(groupId)
              .update({
                members: firebase.firestore.FieldValue.arrayRemove(
                  auth.currentUser?.uid
                ),
              });

            // Add system message about member left
            const leaverInfo = await db
              .collection("users")
              .doc(auth.currentUser?.uid)
              .get();

            await db
              .collection("chats")
              .doc(groupId)
              .collection("messages")
              .add({
                message: `${leaverInfo.data().name} покидає групу`,
                systemMessage: true,
                timestamp: firebase.firestore.Timestamp.now(),
                userId: auth.currentUser?.uid,
              });

            // Update chat system message
            await db
              .collection("chats")
              .doc(groupId)
              .update({
                groupMessage: `${leaverInfo.data().name} покидає групу`,
                groupMessageSenderId: auth.currentUser?.uid,
                groupSystemMessage: true,
                timestamp: firebase.firestore.Timestamp.now(),
              });

            setLoading(false);
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray6 }}>
      <StatusBar style="auto" />

      {chats.length > 0 ? (
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
            shadowRadius: 8,
            shadowColor: colors.gray,
            shadowOpacity: 1,
            shadowOffset: { width: 0, height: 0 },
            elevation: 8,
          }}
          activeOpacity={0.5}
          onPress={() => navigation.navigate("ChatsCreateDialog")}
        >
          <MaterialCommunityIcons
            name="plus"
            size={32}
            color="#fff"
            style={{ textAlign: "center" }}
          />
        </TouchableOpacity>
      ) : null}

      {loading ? (
        <LoadingScreen />
      ) : chats.length > 0 ? (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chat, { backgroundColor: "#fff" }]}
              activeOpacity={0.5}
              onPress={() =>
                navigation.navigate(
                  "ChatsMessages",
                  item.group ? { groupId: item.id } : { userId: item.userId }
                )
              }
              onLongPress={() =>
                (item.group && item.admin) || !item.group
                  ? deleteChat(item.id)
                  : leaveGroup(item.id)
              }
            >
              <ImageBackground
                source={
                  item.photo !== ""
                    ? { uri: item.photo, cache: "force-cache" }
                    : null
                }
                style={[styles.chat_photo, { backgroundColor: colors.gray }]}
                imageStyle={{ borderRadius: 56 }}
              >
                {item.photo === "" ? (
                  <Text
                    style={{
                      fontSize: 28,
                      color: "#fff",
                      includeFontPadding: false,
                    }}
                  >
                    {item.name[0]}
                  </Text>
                ) : null}
              </ImageBackground>

              {!item.group &&
              item.online?.seconds >
                firebase.firestore.Timestamp.now().seconds + 10 ? (
                <View style={styles.chat_online}></View>
              ) : null}

              <View style={styles.chat_info}>
                <View
                  style={[
                    styles.chat_name_date_status,
                    { justifyContent: "space-between" },
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        includeFontPadding: false,
                      }}
                    >
                      {item.name}
                    </Text>

                    {item.verified ? (
                      <MaterialCommunityIcons
                        name="check-decagram"
                        size={18}
                        color={colors.blue}
                        style={{ marginLeft: 2, alignSelf: "stretch" }}
                      />
                    ) : null}
                  </View>

                  <View style={styles.chat_date_status}>
                    {item.me && item.seen ? (
                      <MaterialCommunityIcons
                        name="check-all"
                        size={20}
                        color="green"
                      />
                    ) : item.me ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color="green"
                      />
                    ) : null}

                    <Text
                      style={{
                        fontSize: 13,
                        marginLeft: 4,
                        color: colors.gray,
                      }}
                    >
                      <Moment
                        element={Text}
                        locale="uk"
                        format={
                          moment
                            .unix(moment().unix())
                            .isSame(
                              moment.unix(item.timestamp?.seconds),
                              "date"
                            )
                            ? "HH:mm"
                            : "DD.MM.YYYY"
                        }
                        unix
                      >
                        {item.timestamp?.seconds}
                      </Moment>
                    </Text>
                  </View>
                </View>

                <View style={styles.chat_message_unreadCount}>
                  <Text
                    style={[
                      styles.chat_message,
                      {
                        maxWidth: Dimensions.get("window").width - 100,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {item.me && !item.systemMessage ? (
                      <Text style={{ fontWeight: "bold" }}>Я: </Text>
                    ) : item.group && !item.systemMessage ? (
                      <Text style={{ fontWeight: "bold" }}>
                        {item.messageSenderName}:{" "}
                      </Text>
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
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 64,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              alignItems: "center",
              paddingVertical: 32,
              borderRadius: 16,
              width: "100%",
            }}
          >
            <Text style={{ fontSize: 64 }}>🧐</Text>
            <Text style={{ color: "#000", fontSize: 18, fontWeight: "bold" }}>
              Чатів ще немає...
            </Text>
            <Text style={{ color: colors.gray }}>Розпочніть спілкування</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("ChatsCreateDialog")}
              style={{ marginTop: 8 }}
            >
              <Text
                style={{
                  color: colors.blue,
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Розпочати
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
