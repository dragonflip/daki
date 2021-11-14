import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  AppState,
  Dimensions,
  ImageBackground,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import moment from "moment";
import Moment from "react-moment";
import { useIsFocused } from "@react-navigation/native";

// Styles
import styles from "./styles";
import colors from "../../styles/colors";
// Firebase
import { firebase, db, auth } from "../../firebase";
// Components
import KeyboardAvoider from "../../components/KeyboardAvoider";
import LoadingScreen from "../../components/LoadingScreen";

export default function ChatsMessagesScreen({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const input = useRef();
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState("active");
  const typingTimeout = useRef({ timer: null, typing: false });
  const [chatInfo, setChatInfo] = useState([]);

  const fromMeId = auth.currentUser?.uid;
  const toMeId = route.params.userId;
  const chatId = route.params.groupId ?? [fromMeId, toMeId].sort().join("_");

  // Navigation
  useLayoutEffect(() => {
    if (!loading) {
      navigation.setOptions({
        headerTitle: () => (
          <TouchableOpacity
            onPress={() =>
              chatInfo.group
                ? navigation.navigate("ChatsGroupInfo", { ...route.params })
                : navigation.navigate("ChatsUserInfo", { ...route.params })
            }
          >
            {Platform.OS === "ios" ? (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {chatInfo.name}
                </Text>
                {chatInfo.group ? (
                  <Text style={{ fontSize: 12, color: colors.gray }}>
                    учасників: {chatInfo.membersCount}
                  </Text>
                ) : chatInfo.typing ? (
                  <Text style={{ fontSize: 12, color: colors.gray }}>
                    набирає...
                  </Text>
                ) : chatInfo.online?.seconds >
                  firebase.firestore.Timestamp.now().seconds + 10 ? (
                  <Text style={{ fontSize: 12, color: "green" }}>у мережі</Text>
                ) : (
                  <Text style={{ fontSize: 12, color: colors.gray }}>
                    у мережі{" — "}
                    <Moment
                      element={Text}
                      format={
                        moment
                          .unix(moment().unix())
                          .isSame(moment.unix(chatInfo.online?.seconds), "date")
                          ? "HH:mm"
                          : "DD.MM.YYYY"
                      }
                      unix
                    >
                      {chatInfo.online?.seconds}
                    </Moment>
                  </Text>
                )}
              </View>
            ) : null}
          </TouchableOpacity>
        ),
        headerLeft: () =>
          Platform.OS === "android" ? (
            <TouchableOpacity
              onPress={() =>
                chatInfo.group
                  ? navigation.navigate("ChatsGroupInfo", {
                      ...route.params,
                    })
                  : navigation.navigate("ChatsUserInfo", {
                      ...route.params,
                    })
              }
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ImageBackground
                  source={
                    chatInfo.photo !== ""
                      ? { uri: chatInfo.photo, cache: "force-cache" }
                      : null
                  }
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 44,
                    marginRight: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.gray,
                  }}
                  imageStyle={{ borderRadius: 44 }}
                >
                  {chatInfo.photo === "" ? (
                    <Text
                      style={{
                        fontSize: 22,
                        color: "#fff",
                        includeFontPadding: false,
                      }}
                    >
                      {chatInfo.name[0]}
                    </Text>
                  ) : null}
                </ImageBackground>

                <View>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {chatInfo.name}
                  </Text>

                  {chatInfo.group ? (
                    chatInfo.groupTyping.filter(
                      ([key, value]) =>
                        value.typing == true && key != auth.currentUser.uid
                    ).length > 0 ? (
                      <Text style={{ fontSize: 12, color: colors.gray }}>
                        {chatInfo.groupTyping
                          .filter(([key, value]) => value.typing == true)[0][1]
                          .name.toString()}{" "}
                        набирає...
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 12, color: colors.gray }}>
                        учасників: {chatInfo.membersCount}
                      </Text>
                    )
                  ) : chatInfo.typing ? (
                    <Text style={{ fontSize: 12, color: colors.gray }}>
                      набирає...
                    </Text>
                  ) : chatInfo.online?.seconds >
                    firebase.firestore.Timestamp.now().seconds + 10 ? (
                    <Text style={{ fontSize: 12, color: "green" }}>
                      у мережі
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 12, color: colors.gray }}>
                      у мережі{" — "}
                      <Moment
                        element={Text}
                        format={
                          moment
                            .unix(moment().unix())
                            .isSame(
                              moment.unix(chatInfo.online?.seconds),
                              "date"
                            )
                            ? "HH:mm"
                            : "DD.MM.YYYY"
                        }
                        unix
                      >
                        {chatInfo.online?.seconds}
                      </Moment>
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ) : null,
        headerRight: () =>
          Platform.OS === "ios" ? (
            <TouchableOpacity
              onPress={() =>
                chatInfo.group
                  ? navigation.navigate("ChatsGroupInfo", {
                      ...route.params,
                    })
                  : navigation.navigate("ChatsUserInfo", {
                      ...route.params,
                    })
              }
            >
              <ImageBackground
                source={
                  chatInfo.photo !== ""
                    ? { uri: chatInfo.photo, cache: "force-cache" }
                    : null
                }
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.gray,
                }}
                imageStyle={{ borderRadius: 32 }}
              >
                {chatInfo.photo === "" ? (
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#fff",
                      includeFontPadding: false,
                    }}
                  >
                    {chatInfo.name[0]}
                  </Text>
                ) : null}
              </ImageBackground>
            </TouchableOpacity>
          ) : null,
      });
    }
  });

  // Init
  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);
    let chatSnapshotUnsubscribe;

    console.log(chatId);

    if (route.params.groupId) {
      // Get group info
      chatSnapshotUnsubscribe = db
        .collection("chats")
        .doc(chatId)
        .onSnapshot((snapshot) => {
          if (snapshot.exists) {
            setChatInfo({
              group: true,
              name: snapshot.data().groupName,
              photo: snapshot.data().groupPhoto,
              membersCount: snapshot.data().members.length,
              groupTyping: Object.entries(snapshot.data().typing ?? []),
            });
          }
        });
    } else {
      // Get user info
      chatSnapshotUnsubscribe = db
        .collection("users")
        .doc(route.params.userId)
        .onSnapshot((snapshot) => {
          if (snapshot.exists) {
            setChatInfo(snapshot.data());
            // TODO typing
          }
        });
    }

    // Get messages
    const messagesSnapshotUnsubscribe = db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          // All messages
          let allMessages = snapshot.docs.map((doc) => {
            return {
              id: doc.id,
              me: doc.data().userId === auth.currentUser?.uid,
              group: chatId === route.params.userId,
              ...doc.data(),
            };
          });

          // Date chips
          let prevMessageDate = "";

          snapshot.docs.reverse().forEach((doc, index) => {
            let messageDateChip = false;

            if (
              prevMessageDate !=
              moment.unix(doc.data().timestamp.seconds).format("DD.MM.YYYY")
            ) {
              prevMessageDate = moment
                .unix(doc.data().timestamp.seconds)
                .format("DD.MM.YYYY");
              messageDateChip = true;
            }

            allMessages[allMessages.length - index - 1].dateChip =
              messageDateChip;
          });

          setMessages(allMessages);
          setLoading(false);
        } else {
          setMessages([]);
          setLoading(false);
        }
      });

    return () => {
      chatSnapshotUnsubscribe();
      messagesSnapshotUnsubscribe();
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  // Handle app state
  const handleAppStateChange = (state) => {
    setAppState(state);
  };

  // Read messages
  useEffect(() => {
    if (isFocused && appState !== "background" && messages.length > 0) {
      // Update message seen
      db.collection("chats")
        .doc(chatId)
        .collection("messages")
        .where("userId", "!=", auth.currentUser?.uid)
        .where("seen", "==", false)
        .get()
        .then((messages) => {
          if (!messages.empty) {
            messages.docs.forEach((message) => {
              message.ref.update({ seen: true });
            });

            // Dialog
            if (!route.params.groupId) {
              db.collection("chats").doc(chatId).update({
                unreadCount: 0,
              });
            }
          }
        });

      // Update group unread messages
      if (route.params.groupId) {
        db.collection("chats")
          .doc(chatId)
          .update({
            [`unreadCount.${auth.currentUser?.uid}`]: 0,
          });
      }
    }
  }, [appState, isFocused, messages]);

  // Send message
  const sendMessage = async () => {
    if (inputMessage.trim() !== "") {
      input.current.clear();

      const fromMeInfo = (
        await db.collection("users").doc(fromMeId).get()
      ).data();
      const toMeInfo = (await db.collection("users").doc(toMeId).get()).data();

      if (chatId === route.params.userId) {
        // Group
        await db.collection("chats").doc(chatId).collection("messages").add({
          message: inputMessage,
          timestamp: firebase.firestore.Timestamp.now(),
          userId: auth.currentUser?.uid,
          userName: fromMeInfo.name,
          seen: false,
        });

        const members = (await db.collection("chats").doc(chatId).get()).data()
          .members;

        await db
          .collection("chats")
          .doc(chatId)
          .update({
            groupMessage: inputMessage,
            groupMessageSenderId: fromMeId,
            groupMessageSenderName: fromMeInfo.name,
            timestamp: firebase.firestore.Timestamp.now(),
            ...Object.fromEntries(
              members.map((id) => [
                `unreadCount.${id}`,
                firebase.firestore.FieldValue.increment(+(id !== fromMeId)),
              ])
            ),
          });
      } else {
        // Dialog
        await db.collection("chats").doc(chatId).collection("messages").add({
          message: inputMessage,
          timestamp: firebase.firestore.Timestamp.now(),
          userId: auth.currentUser?.uid,
          seen: false,
        });

        // Check if chat not exists
        const chat = await db.collection("chats").doc(chatId).get();

        if (!chat.exists) {
          await db
            .collection("chats")
            .doc(chatId)
            .set({
              group: false,
              members: [fromMeId, toMeId],
              blocked: {
                [fromMeId]: false,
                [toMeId]: false,
              },
              message: {
                [fromMeId]: inputMessage,
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
                [fromMeId]: fromMeInfo.photo,
                [toMeId]: toMeInfo.photo,
              },
              timestamp: firebase.firestore.Timestamp.now(),
              typing: {
                [fromMeId]: false,
                [toMeId]: false,
              },
              unreadCount: 0,
            });
        }

        await db
          .collection("chats")
          .doc(chatId)
          .update({
            message: {
              [fromMeId]: inputMessage,
              [toMeId]: "",
            },
            timestamp: firebase.firestore.Timestamp.now(),
            unreadCount: firebase.firestore.FieldValue.increment(1),
          });
      }

      setInputMessage("");
    }
  };

  // Delete message
  const deleteMessage = (messageId) => {
    Haptics.selectionAsync();

    Alert.alert(
      "Видалити повідомлення?",
      "Повідомлення буде видалено для всіх",
      [
        {
          text: "Скасувати",
          style: "cancel",
        },
        {
          text: "Видалити",
          style: "destructive",
          onPress: async () => {
            // Get info about message that will be deleted
            const deletedMessage = (
              await db
                .collection("chats")
                .doc(chatId)
                .collection("messages")
                .doc(messageId)
                .get()
            ).data();

            // Delete message
            await db
              .collection("chats")
              .doc(chatId)
              .collection("messages")
              .doc(messageId)
              .delete();

            // Get last message reference
            const lastMessageRef = await db
              .collection("chats")
              .doc(chatId)
              .collection("messages")
              .orderBy("timestamp", "desc")
              .limit(1)
              .get();

            // If chat has 0 messages delete it
            if (lastMessageRef.empty) {
              await db.collection("chats").doc(chatId).delete();

              navigation.goBack();
            } else {
              const lastMessage = lastMessageRef.docs[0].data();

              // Update chat info
              if (chatId === route.params.userId) {
                // Group
                const members = (
                  await db.collection("chats").doc(chatId).get()
                ).data().members;

                await db
                  .collection("chats")
                  .doc(chatId)
                  .update({
                    groupMessage: lastMessage.message,
                    groupMessageSenderId: lastMessage.userId,
                    groupMessageSenderName: lastMessage.userName,
                    timestamp: lastMessage.timestamp,
                    ...Object.fromEntries(
                      members.map((id) => [
                        `unreadCount.${id}`,
                        firebase.firestore.FieldValue.increment(
                          -(
                            id !== auth.currentUser?.uid && !deletedMessage.seen
                          )
                        ),
                      ])
                    ),
                  });
              } else {
                // Dialog
                await db
                  .collection("chats")
                  .doc(chatId)
                  .update({
                    message: {
                      [auth.currentUser?.uid]: "",
                      [route.params.userId]: "",
                      [lastMessage.userId]: lastMessage.message,
                    },
                    timestamp: lastMessage.timestamp,
                    unreadCount: firebase.firestore.FieldValue.increment(
                      -!deletedMessage.seen
                    ),
                  });
              }
            }
          },
        },
      ]
    );
  };

  // Typing
  const typing = async () => {
    // Start typing

    if (!typingTimeout.current.typing) {
      typingTimeout.current.typing = true;

      if (chatInfo.group) {
        var query = {
          name: (
            await db.collection("users").doc(auth.currentUser?.uid).get()
          ).data().name,
          typing: true,
        };
      } else {
        var query = true;
      }

      db.collection("chats")
        .doc(chatId)
        .update({
          //[`typing.${auth.currentUser?.uid}`]: true,
          [`typing.${auth.currentUser?.uid}`]: query,
        });
    }

    // Clear timer
    if (typingTimeout.current.timer) {
      clearTimeout(typingTimeout.current.timer);
      typingTimeout.current.timer = null;
    }

    // Stop typing
    typingTimeout.current.timer = setTimeout(async () => {
      typingTimeout.current.typing = false;

      if (chatInfo.group) {
        var query = {
          name: (
            await db.collection("users").doc(auth.currentUser?.uid).get()
          ).data().name,
          typing: false,
        };
      } else {
        var query = false;
      }

      db.collection("chats")
        .doc(chatId)
        .update({
          [`typing.${auth.currentUser?.uid}`]: query,
        });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <SafeAreaView style={{ flex: 1, paddingBottom: 8 }}>
        <KeyboardAvoider
          style={styles.container}
          hasScrollable={true}
          topSpacing={-24}
        >
          {loading ? (
            <LoadingScreen />
          ) : messages.length > 0 ? (
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingBottom: 8,
              }}
              keyboardShouldPersistTaps="handled"
              inverted={true}
              renderItem={({ item }) => (
                <View>
                  {item.dateChip ? (
                    <View style={styles.messageDateChip}>
                      <Moment
                        element={Text}
                        unix
                        format="DD.MM.YYYY"
                        style={styles.messageDateChipText}
                      >
                        {item.timestamp.seconds}
                      </Moment>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={item.me ? styles.messageFromMe : styles.messageToMe}
                    activeOpacity={0.5}
                    onLongPress={() => deleteMessage(item.id)}
                    disabled={!item.me}
                  >
                    <View>
                      {item.group && !item.me ? (
                        <TouchableOpacity
                          style={{ alignSelf: "baseline" }}
                          onPress={() =>
                            navigation.navigate("ChatsUserInfo", {
                              userId: item.userId,
                            })
                          }
                        >
                          <Text style={{ fontWeight: "bold" }}>
                            {item.userName}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      <Text
                        style={[
                          item.me
                            ? styles.messageTextFromMe
                            : styles.messageTextToMe,
                          {
                            maxWidth: Dimensions.get("window").width - 128,
                          },
                        ]}
                      >
                        {item.message}
                      </Text>
                    </View>

                    <Text style={styles.messageTime}>
                      <Moment element={Text} unix format="HH:mm">
                        {item.timestamp}
                      </Moment>
                    </Text>

                    {item.me && item.seen ? (
                      <MaterialCommunityIcons
                        name="check-all"
                        size={16}
                        color="#999"
                        style={{ alignSelf: "flex-end", height: 15 }}
                      />
                    ) : item.me ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="#999"
                        style={{ alignSelf: "flex-end", height: 15 }}
                      />
                    ) : null}
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.gray6,
              }}
            >
              <MaterialCommunityIcons
                name="message"
                size={128}
                color={colors.gray}
              />
              <Text style={{ color: "#000", fontSize: 24, fontWeight: "bold" }}>
                Немає повідомлень
              </Text>
              <TouchableOpacity onPress={() => input.current.focus()}>
                <Text style={{ color: colors.blue, fontSize: 16 }}>
                  Написати
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!chatInfo.blocked ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <TextInput
                style={{
                  borderColor: colors.gray6,
                  borderWidth: 2,
                  borderRadius: 16,
                  paddingTop: Platform.OS === "ios" ? 10 : 4,
                  paddingBottom: Platform.OS === "ios" ? 10 : 4,
                  paddingHorizontal: 16,
                  marginLeft: 16,
                  flex: 1,
                  minHeight: 40,
                }}
                placeholder="Повідомлення..."
                onChangeText={(message) => {
                  setInputMessage(message);
                  // typing(); // TODO typing
                }}
                ref={input}
                selectionColor="#000"
                multiline={true}
              />
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                }}
                onPress={sendMessage}
              >
                <MaterialCommunityIcons name="send" size={28} color="#000" />
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: "#eee",
                alignItems: "center",
                paddingVertical: 16,
                marginTop: 8,
              }}
            >
              <Text style={{ color: "red" }}>
                Ви не можете писати через блокування
              </Text>
            </View>
          )}
        </KeyboardAvoider>
      </SafeAreaView>
    </View>
  );
}
