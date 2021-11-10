import React, { useState, useEffect, useRef } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  AppState,
  Dimensions,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import moment from "moment";
import "moment/locale/uk";
import Moment from "react-moment";
import { useIsFocused } from "@react-navigation/native";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db, auth } from "../../firebase";
// Components
import KeyboardAvoider from "../../components/KeyboardAvoider";

export default function ChatHistoryScreen({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const input = useRef();
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState("active");
  const typingTimeout = useRef({ timer: null, typing: false });
  const [chatInfo, setChatInfo] = useState([]);

  // Init
  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);

    // Get chat info
    const chatSnapshotUnsubscribe = db
      .collection("chats")
      .doc(route.params.chatId)
      .onSnapshot((snapshot) => {
        const fromMeId = auth.currentUser?.uid;
        const toMeId = snapshot
          .data()
          .members.filter((member) => member != fromMeId)[0];

        let chatInfo;

        if (snapshot.data().group) {
          // Group
          chatInfo = {
            group: true,
            name: snapshot.data().groupName,
            photo: snapshot.data().groupPhoto,
            membersCount: snapshot.data().members.length,
          };
        } else {
          // Dialog
          chatInfo = {
            name: snapshot.data().name[toMeId],
            photo: snapshot.data().photo[toMeId],
            online: snapshot.data().online[toMeId],
            typing: snapshot.data().typing[toMeId],
          };
        }

        setChatInfo(chatInfo);

        // Change header
        navigation.setOptions({
          headerTitle: () => (
            <TouchableOpacity
              onPress={() =>
                chatInfo.group
                  ? navigation.navigate("ChatsGroupInfo", {
                      chatId: route.params.chatId,
                    })
                  : navigation.navigate("ChatsUserInfo", {
                      userId: route.params.userId,
                    })
              }
            >
              {Platform.OS === "ios" ? (
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {chatInfo.name}
                  </Text>
                  {chatInfo.group ? (
                    <Text style={{ fontSize: 12, color: "grey" }}>
                      учасників: {chatInfo.membersCount}
                    </Text>
                  ) : chatInfo.typing ? (
                    <Text style={{ fontSize: 12, color: "grey" }}>
                      набирає...
                    </Text>
                  ) : chatInfo.online?.seconds >
                    firebase.firestore.Timestamp.now().seconds + 10 ? (
                    <Text style={{ fontSize: 12, color: "green" }}>онлайн</Text>
                  ) : (
                    <View>
                      <Text style={{ fontSize: 12, color: "grey" }}>
                        в мережі{" "}
                        <Moment element={Text} locale="uk" fromNow unix>
                          {chatInfo.online?.seconds}
                        </Moment>
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -8,
                  }}
                >
                  {chatInfo.photo != "" ? (
                    <Image
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 42,
                        marginRight: 12,
                      }}
                      source={{
                        uri: chatInfo.photo,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        backgroundColor: "#aaa",
                        width: 42,
                        height: 42,
                        borderRadius: 42,
                        marginRight: 12,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 20, color: "#fff" }}>
                        {chatInfo.name[0]}
                      </Text>
                    </View>
                  )}
                  <View style={{ flexDirection: "column" }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {chatInfo.name}
                    </Text>

                    {chatInfo.group ? (
                      <Text style={{ fontSize: 12, color: "grey" }}>
                        учасників: {chatInfo.membersCount}
                      </Text>
                    ) : chatInfo.typing ? (
                      <Text style={{ fontSize: 12, color: "grey" }}>
                        набирає...
                      </Text>
                    ) : chatInfo.online?.seconds >
                      firebase.firestore.Timestamp.now().seconds + 10 ? (
                      <Text style={{ fontSize: 12, color: "green" }}>
                        онлайн
                      </Text>
                    ) : (
                      <View>
                        <Text style={{ fontSize: 12, color: "grey" }}>
                          в мережі{" "}
                          <Moment element={Text} locale="uk" fromNow unix>
                            {chatInfo.online?.seconds}
                          </Moment>
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ),
          headerRight: () =>
            Platform.OS === "ios" ? (
              <TouchableOpacity
                onPress={() => navigation.navigate("MyProfile")}
              >
                {chatInfo.photo != "" ? (
                  <Image
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 32,
                      marginRight: -8,
                    }}
                    source={{
                      uri: chatInfo.photo,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      backgroundColor: "#aaa",
                      width: 32,
                      height: 32,
                      borderRadius: 32,
                      marginRight: -8,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 20, color: "#fff" }}>
                      {chatInfo.name[0]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : null,
        });
      });

    // Get messages
    const messagesSnapshotUnsubscribe = db
      .collection("chats")
      .doc(route.params.chatId)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          // All messages
          let allMessages = snapshot.docs.map((doc) => {
            return {
              id: doc.id,
              me: doc.data().userId == auth.currentUser?.uid,
              group: route.params.chatId === route.params.userId,
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
          navigation.goBack();
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
        .doc(route.params.chatId)
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
            if (route.params.chatId !== route.params.userId) {
              db.collection("chats").doc(route.params.chatId).update({
                unreadCount: 0,
              });
            }
          }
        });

      // Update group unread messages
      if (route.params.chatId === route.params.userId) {
        db.collection("chats")
          .doc(route.params.chatId)
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

      const fromMeId = auth.currentUser?.uid;
      const toMeId = route.params.userId;

      const fromMeInfo = (
        await db.collection("users").doc(fromMeId).get()
      ).data();

      if (route.params.chatId === route.params.userId) {
        // Group
        await db
          .collection("chats")
          .doc(route.params.chatId)
          .collection("messages")
          .add({
            message: inputMessage,
            timestamp: firebase.firestore.Timestamp.now(),
            userId: auth.currentUser?.uid,
            userName: fromMeInfo.name,
            seen: false,
          });

        const members = (
          await db.collection("chats").doc(route.params.chatId).get()
        ).data().members;

        await db
          .collection("chats")
          .doc(route.params.chatId)
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
        await db
          .collection("chats")
          .doc(route.params.chatId)
          .collection("messages")
          .add({
            message: inputMessage,
            timestamp: firebase.firestore.Timestamp.now(),
            userId: auth.currentUser?.uid,
            seen: false,
          });

        await db
          .collection("chats")
          .doc(route.params.chatId)
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
                .doc(route.params.chatId)
                .collection("messages")
                .doc(messageId)
                .get()
            ).data();

            // Delete message
            await db
              .collection("chats")
              .doc(route.params.chatId)
              .collection("messages")
              .doc(messageId)
              .delete();

            // Get last message reference
            const lastMessageRef = await db
              .collection("chats")
              .doc(route.params.chatId)
              .collection("messages")
              .orderBy("timestamp", "desc")
              .limit(1)
              .get();

            // If chat has 0 messages then delete it
            if (lastMessageRef.empty) {
              await db.collection("chats").doc(route.params.chatId).delete();

              navigation.goBack();
            } else {
              const lastMessage = lastMessageRef.docs[0].data();

              // Update chat info
              if (route.params.chatId === route.params.userId) {
                // Group
                const members = (
                  await db.collection("chats").doc(route.params.chatId).get()
                ).data().members;

                await db
                  .collection("chats")
                  .doc(route.params.chatId)
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
                  .doc(route.params.chatId)
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
  const typing = () => {
    // Start typing
    if (!typingTimeout.current.typing) {
      typingTimeout.current.typing = true;

      db.collection("chats")
        .doc(route.params.chatId)
        .update({
          [`typing.${auth.currentUser?.uid}`]: true,
        });
    }

    // Clear timer
    if (typingTimeout.current.timer) {
      clearTimeout(typingTimeout.current.timer);
      typingTimeout.current.timer = null;
    }

    // Stop typing
    typingTimeout.current.timer = setTimeout(() => {
      typingTimeout.current.typing = false;

      db.collection("chats")
        .doc(route.params.chatId)
        .update({
          [`typing.${auth.currentUser?.uid}`]: false,
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
          {messages.length > 0 ? (
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
                        <TouchableOpacity style={{ alignSelf: "baseline" }}>
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
                      <Ionicons
                        name="checkmark-done"
                        size={16}
                        color="#999"
                        style={{ alignSelf: "flex-end", height: 15 }}
                      />
                    ) : item.me ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color="#999"
                        style={{ alignSelf: "flex-end", height: 15 }}
                      />
                    ) : null}
                  </TouchableOpacity>
                </View>
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
              <MaterialCommunityIcons
                name="message-outline"
                size={128}
                color="grey"
              />
              <Text style={{ color: "#000", fontSize: 20, fontWeight: "bold" }}>
                Немає повідомлень
              </Text>
              <TouchableOpacity onPress={() => input.current.focus()}>
                <Text style={{ color: "blue" }}>Написати</Text>
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
                  borderColor: "#eee",
                  borderWidth: 2,
                  borderRadius: 44,
                  height: 44,
                  paddingHorizontal: 16,
                  marginHorizontal: 16,
                  flex: 1,
                }}
                placeholder="Повідомлення..."
                onChangeText={(message) => {
                  setInputMessage(message);
                  typing();
                }}
                ref={input}
                selectionColor="#000"
              />
              <TouchableOpacity
                style={{ marginRight: 16 }}
                onPress={sendMessage}
              >
                <Ionicons name="send" size={24} color="#000" />
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
