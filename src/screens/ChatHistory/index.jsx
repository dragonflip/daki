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

  // Init
  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);

    let onlineChecker;

    // Get member
    // TODO chat group info
    const memberSnapshotUnsubscribe = db
      .collection("users")
      .doc(route.params.userId)
      .onSnapshot((snapshot) => {
        changeHeader(snapshot.data());
        clearInterval(onlineChecker);

        // Check online status for changes
        onlineChecker = setInterval(() => {
          if (
            snapshot.data().online?.seconds <
            firebase.firestore.Timestamp.now().seconds
          ) {
            changeHeader(snapshot.data());
            clearInterval(onlineChecker);
          }
        }, 10000);
      });

    const changeHeader = (chatInfo) => {
      // Change header
      navigation.setOptions({
        headerTitle: () => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Profile", {
                userId: route.params.userId,
              })
            }
          >
            {Platform.OS === "ios" ? (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {chatInfo.name}
                </Text>
                {chatInfo.online?.seconds >
                firebase.firestore.Timestamp.now().seconds + 10 ? (
                  <Text style={{ fontSize: 12, color: "green" }}>онлайн</Text>
                ) : (
                  <View>
                    <Text style={{ fontSize: 12, color: "grey" }}>
                      В мережі{" "}
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
                {chatInfo.profilePhoto != "" ? (
                  <Image
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 42,
                      marginRight: 12,
                    }}
                    source={{
                      uri: chatInfo.profilePhoto,
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
                  {chatInfo.online?.seconds >
                  firebase.firestore.Timestamp.now().seconds + 10 ? (
                    <Text style={{ fontSize: 12, color: "green" }}>онлайн</Text>
                  ) : (
                    <View>
                      <Text style={{ fontSize: 12, color: "grey" }}>
                        В мережі{" "}
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
            <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
              {chatInfo.profilePhoto != "" ? (
                <Image
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 32,
                    marginRight: -8,
                  }}
                  source={{
                    uri: chatInfo.profilePhoto,
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
    };

    // Get messages
    const messagesSnapshotUnsubscribe = db
      .collection("chats_dev")
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
      memberSnapshotUnsubscribe();
      messagesSnapshotUnsubscribe();
      clearInterval(onlineChecker);
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
      db.collection("chats_dev")
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

            db.collection("chats_dev").doc(route.params.chatId).update({
              unreadCount: 0,
            });
          }
        });
    }
  }, [appState, isFocused, messages]);

  // Send message
  const sendMessage = async () => {
    if (inputMessage.trim() !== "") {
      input.current.clear();

      await db
        .collection("chats_dev")
        .doc(route.params.chatId)
        .collection("messages")
        .add({
          message: inputMessage,
          timestamp: firebase.firestore.Timestamp.now(),
          userId: auth.currentUser?.uid,
          seen: false,
        });

      const fromMeId = auth.currentUser?.uid;
      const toMeId = route.params.userId;

      await db
        .collection("chats_dev")
        .doc(route.params.chatId)
        .update({
          message: {
            [fromMeId]: inputMessage,
            [toMeId]: "",
          },
          timestamp: firebase.firestore.Timestamp.now(),
          unreadCount: firebase.firestore.FieldValue.increment(1),
        });

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
            const fromMeId = auth.currentUser?.uid;
            const toMeId = route.params.userId;

            // Get info about message that will be deleted
            const deletedMessage = (
              await db
                .collection("chats_dev")
                .doc(route.params.chatId)
                .collection("messages")
                .doc(messageId)
                .get()
            ).data();

            // Delete message
            await db
              .collection("chats_dev")
              .doc(route.params.chatId)
              .collection("messages")
              .doc(messageId)
              .delete();

            // Get last message reference
            const lastMessageRef = await db
              .collection("chats_dev")
              .doc(route.params.chatId)
              .collection("messages")
              .orderBy("timestamp", "desc")
              .limit(1)
              .get();

            // If chat has 0 messages then delete it
            if (lastMessageRef.empty) {
              await db
                .collection("chats_dev")
                .doc(route.params.chatId)
                .delete();

              navigation.goBack();
            } else {
              const lastMessage = lastMessageRef.docs[0].data();

              // Change chat info
              await db
                .collection("chats_dev")
                .doc(route.params.chatId)
                .update({
                  message: {
                    [fromMeId]:
                      lastMessage.userId === fromMeId
                        ? lastMessage.message
                        : "",
                    [toMeId]:
                      lastMessage.userId === toMeId ? lastMessage.message : "",
                  },
                  timestamp: lastMessage.timestamp,
                  unreadCount: !deletedMessage.seen
                    ? firebase.firestore.FieldValue.increment(-1)
                    : firebase.firestore.FieldValue.increment(0),
                });
            }
          },
        },
      ]
    );
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
                    <Text
                      style={
                        item.me
                          ? styles.messageTextFromMe
                          : styles.messageTextToMe
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

          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
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
              selectionColor="#000"
            />
            <TouchableOpacity style={{ marginRight: 16 }} onPress={sendMessage}>
              <Ionicons name="send" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoider>
      </SafeAreaView>
    </View>
  );
}
