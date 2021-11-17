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
  Linking,
  Modal,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import moment from "moment";
import Moment from "react-moment";
import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import uuid from "uuid";
import ImageViewer from "react-native-image-zoom-viewer";

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
  const [modalVIsible, setModalVIsible] = useState("");
  const [chatTyping, setChatTyping] = useState(null);
  const chatExists = useRef(false);

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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingLeft: chatInfo.verified ? 20 : 0,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {chatInfo.name}
                  </Text>

                  {chatInfo.verified ? (
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={18}
                      color={colors.blue}
                      style={{ marginLeft: 2 }}
                    />
                  ) : null}
                </View>

                {chatInfo.group ? (
                  chatTyping?.length > 2 ? (
                    <Text style={{ fontSize: 12, color: colors.gray }}>
                      {chatTyping?.length} людей набирає...
                    </Text>
                  ) : chatTyping?.length === 2 ? (
                    <Text style={{ fontSize: 12, color: colors.gray }}>
                      {chatTyping?.map(
                        (userTyping, index) =>
                          `${userTyping.name}${index === 0 ? " та " : " "}`
                      )}
                      набирає...
                    </Text>
                  ) : chatTyping?.filter((userTyping) => userTyping.typing)
                      .length === 1 ? (
                    <Text style={{ fontSize: 12, color: colors.gray }}>
                      {chatTyping?.map(
                        (userTyping) => `${userTyping.name} набирає...`
                      )}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 12, color: colors.gray }}>
                      учасників: {chatInfo.membersCount}
                    </Text>
                  )
                ) : chatTyping ? (
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
                          : "DD.MM.YYYY в HH:mm"
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
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {chatInfo.name}
                    </Text>

                    {chatInfo.verified ? (
                      <MaterialCommunityIcons
                        name="check-decagram"
                        size={18}
                        color={colors.blue}
                        style={{ marginLeft: 2 }}
                      />
                    ) : null}
                  </View>

                  {chatInfo.group ? (
                    chatTyping?.length > 2 ? (
                      <Text style={{ fontSize: 12, color: colors.gray }}>
                        {chatTyping?.length} людей набирає...
                      </Text>
                    ) : chatTyping?.length === 2 ? (
                      <Text style={{ fontSize: 12, color: colors.gray }}>
                        {chatTyping?.map(
                          (userTyping, index) =>
                            `${userTyping.name}${index === 0 ? " та " : " "}`
                        )}
                        набирає...
                      </Text>
                    ) : chatTyping?.filter((userTyping) => userTyping.typing)
                        .length === 1 ? (
                      <Text style={{ fontSize: 12, color: colors.gray }}>
                        {chatTyping?.map(
                          (userTyping) => `${userTyping.name} набирає...`
                        )}
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 12, color: colors.gray }}>
                        учасників: {chatInfo.membersCount}
                      </Text>
                    )
                  ) : chatTyping ? (
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
                            : "DD.MM.YYYY в HH:mm"
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
              typing: Object.entries(snapshot.data()?.typing ?? []),
              verified: snapshot.data().groupVerified,
            });

            // Auto exit after kicking by admin
            if (!snapshot.data().members.includes(auth.currentUser?.uid)) {
              navigation.navigate("Chats");
            }
          } else {
            // Auto exit after group deleting
            navigation.navigate("Chats");
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
              ...doc.data(),
              id: doc.id,
              me: doc.data().userId === auth.currentUser?.uid,
              group: chatId === route.params.groupId,
              link:
                doc.data().message.substr(0, 7) === "http://" ||
                doc.data().message.substr(0, 8) === "https://",
            };
          });

          // Member photo and name
          let prevSenderId = snapshot.docs[0].data().userId;
          let firstTimeShow = true;

          snapshot.docs.reverse().forEach((doc, index) => {
            if (doc.data().systemMessage) return;

            let showSenderPhoto = false;
            let showSenderName = false;

            if (prevSenderId !== doc.data().userId) {
              firstTimeShow = true;
            }

            if (firstTimeShow) {
              prevSenderId = doc.data().userId;
              showSenderPhoto = true;
              showSenderName = true;

              firstTimeShow = false;
            }

            allMessages[allMessages.length - index - 1].showSenderPhoto =
              showSenderPhoto;
            allMessages[allMessages.length - index - 1].showSenderName =
              showSenderName;
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

  // Handle typing
  useEffect(() => {
    let chatTypingSnapshotUnsubscribe;

    db.collection("chats")
      .doc(chatId)
      .get()
      .then((chat) => {
        if (chat.exists) {
          // Get chat info
          chatTypingSnapshotUnsubscribe = db
            .collection("chats")
            .doc(chatId)
            .onSnapshot((snapshot) => {
              if (snapshot.exists) {
                if (snapshot.data().group) {
                  // Group
                  try {
                    setChatTyping(
                      Object.keys(snapshot.data().typing)
                        .filter((userId) => userId !== fromMeId)
                        .map((userId) => snapshot.data().typing[userId])
                        .filter((userTyping) => userTyping.typing)
                    );
                  } catch {}
                } else {
                  // Dialog
                  setChatTyping(snapshot.data().typing[toMeId]);
                }

                chatExists.current = true;
              }
            });
        }
      });

    return () => {
      try {
        chatTypingSnapshotUnsubscribe();
      } catch {}
    };
  }, [chatExists.current]);

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
  const sendMessage = async (attachmentUrl = null) => {
    if (inputMessage.trim() !== "" || attachmentUrl !== null) {
      input.current.clear();

      const fromMeInfo = (
        await db.collection("users").doc(fromMeId).get()
      ).data();
      const toMeInfo = (await db.collection("users").doc(toMeId).get()).data();

      if (chatId === route.params.groupId) {
        // Group
        await db
          .collection("chats")
          .doc(chatId)
          .collection("messages")
          .add({
            message: attachmentUrl !== null ? "Фотографія" : inputMessage,
            systemMessage: false,
            timestamp: firebase.firestore.Timestamp.now(),
            userId: auth.currentUser?.uid,
            userName: fromMeInfo.name,
            userPhoto: fromMeInfo.photo,
            seen: false,
            attachment: attachmentUrl,
          });

        // TODO reimplement unread count
        const members = (await db.collection("chats").doc(chatId).get()).data()
          .members;

        await db
          .collection("chats")
          .doc(chatId)
          .update({
            groupMessage: attachmentUrl !== null ? "Фотографія" : inputMessage,
            groupMessageSenderId: fromMeId,
            groupMessageSenderName: fromMeInfo.name,
            groupSystemMessage: false,
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

        // Check if chat not exists
        const chat = await db.collection("chats").doc(chatId).get();

        if (!chat.exists) {
          await db
            .collection("chats")
            .doc(chatId)
            .set({
              group: false,
              members: [fromMeId, toMeId],
              message: {
                [fromMeId]:
                  attachmentUrl !== null ? "Фотографія" : inputMessage,
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
              verified: {
                [fromMeId]: fromMeInfo.verified,
                [toMeId]: toMeInfo.verified,
              },
              timestamp: firebase.firestore.Timestamp.now(),
              typing: {
                [fromMeId]: false,
                [toMeId]: false,
              },
              unreadCount: 0,
              attachment: attachmentUrl,
            });

          chatExists.current = true;
        }

        // Add to messages
        await db
          .collection("chats")
          .doc(chatId)
          .collection("messages")
          .add({
            message: attachmentUrl !== null ? "Фотографія" : inputMessage,
            timestamp: firebase.firestore.Timestamp.now(),
            userId: auth.currentUser?.uid,
            seen: false,
            attachment: attachmentUrl,
          });

        // Update chat last message
        await db
          .collection("chats")
          .doc(chatId)
          .update({
            message: {
              [fromMeId]: attachmentUrl !== null ? "Фотографія" : inputMessage,
              [toMeId]: "",
            },
            timestamp: firebase.firestore.Timestamp.now(),
            unreadCount: firebase.firestore.FieldValue.increment(1),
          });
      }

      setInputMessage("");
    }
  };

  // Send photo
  const sendAttachment = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
    });

    if (!result.cancelled) {
      const manipResult = await ImageManipulator.manipulateAsync(result.uri, [
        {
          resize: {
            width: 480,
            height: 480,
          },
        },
      ]);

      const response = await fetch(manipResult.uri);
      const blob = await response.blob();

      // Add photo
      const snapshot = await firebase
        .storage()
        .ref()
        .child(`${auth.currentUser?.uid}/messages/${chatId}/${uuid.v4()}`)
        .put(blob);

      const url = await snapshot.ref.getDownloadURL();

      console.log(url);
      sendMessage(url);
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

            // Delete message attachment
            try {
              await firebase
                .storage()
                .ref()
                .child(
                  deletedMessage.attachment
                    .substr(73, deletedMessage.attachment.length - 73 - 53)
                    .replaceAll("%2F", "/")
                )
                .delete();
            } catch {}

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
            } else {
              const lastMessage = lastMessageRef.docs[0].data();

              // Update chat info
              if (chatId === route.params.groupId) {
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
                    groupSystemMessage: lastMessage.systemMessage,
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
    if (chatExists.current) {
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
    }
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
                    <View style={{ alignSelf: "center", marginVertical: 16 }}>
                      <Moment
                        element={Text}
                        unix
                        format="DD.MM.YYYY"
                        style={{ color: colors.gray }}
                      >
                        {item.timestamp.seconds}
                      </Moment>
                    </View>
                  ) : null}

                  {modalVIsible != "" ? (
                    <Modal visible={true} transparent={true}>
                      <ImageViewer
                        onSwipeDown={() => setModalVIsible("")}
                        enableSwipeDown={true}
                        imageUrls={[{ url: modalVIsible }]}
                      ></ImageViewer>
                    </Modal>
                  ) : null}

                  {item.systemMessage ? (
                    <TouchableOpacity
                      style={{ alignSelf: "center", margin: 8 }}
                      onPress={() =>
                        navigation.navigate("ChatsUserInfo", {
                          userId: item.userId,
                        })
                      }
                    >
                      <Text>{item.message}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={[
                        item.group && !item.me
                          ? { flexDirection: "row", alignItems: "flex-start" }
                          : null,
                        item.showSenderPhoto ? { marginTop: 4 } : null,
                      ]}
                    >
                      {item.group && !item.me && item.showSenderPhoto ? (
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("ChatsUserInfo", {
                              userId: item.userId,
                            })
                          }
                          style={{ marginTop: 8 }}
                        >
                          <ImageBackground
                            source={
                              item.userPhoto !== ""
                                ? { uri: item.userPhoto, cache: "force-cache" }
                                : null
                            }
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 40,
                              marginLeft: 12,
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: colors.gray,
                            }}
                            imageStyle={{ borderRadius: 44 }}
                          >
                            {item.userPhoto === "" ? (
                              <Text
                                style={{
                                  fontSize: 22,
                                  color: "#fff",
                                  includeFontPadding: false,
                                }}
                              >
                                {item.userName[0]}
                              </Text>
                            ) : null}
                          </ImageBackground>
                        </TouchableOpacity>
                      ) : null}

                      <TouchableOpacity
                        style={[
                          {
                            marginHorizontal: 12,
                            marginVertical: 2,

                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,

                            alignItems: "flex-end",
                            flexDirection: "row",
                          },
                          !item.attachment
                            ? {
                                paddingLeft: 16,
                                paddingRight: 8,
                                paddingVertical: 8,
                              }
                            : null,
                          item.me
                            ? {
                                backgroundColor: !item.attachment
                                  ? "#000"
                                  : null,
                                alignSelf: "flex-end",

                                borderBottomLeftRadius: 16,
                              }
                            : {
                                backgroundColor: !item.attachment
                                  ? colors.gray6
                                  : null,
                                alignSelf: "flex-start",

                                borderBottomRightRadius: 16,
                              },
                          item.group && !item.me && !item.showSenderPhoto
                            ? { marginLeft: 60 }
                            : item.group
                            ? { marginLeft: 8 }
                            : null,
                        ]}
                        activeOpacity={0.5}
                        onLongPress={
                          item.me ? () => deleteMessage(item.id) : null
                        }
                        disabled={!item.link && !item.attachment && !item.me}
                        onPress={
                          item.attachment
                            ? () => {
                                setModalVIsible(item.attachment);
                              }
                            : item.link
                            ? () => Linking.openURL(item.message)
                            : null
                        }
                      >
                        <View>
                          {item.group &&
                          !item.me &&
                          item.showSenderName &&
                          !item.attachment ? (
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

                          {item.attachment ? (
                            <ImageBackground
                              source={{
                                uri: item.attachment,
                                cache: "force-cache",
                              }}
                              style={{
                                width: Dimensions.get("window").width - 92,
                                height:
                                  (Dimensions.get("window").width - 92) /
                                  (4 / 3),
                                justifyContent: "flex-end",
                                alignItems: "flex-end",
                                padding: 8,
                              }}
                              imageStyle={{
                                borderRadius: 16,
                                borderWidth: 2,
                                borderColor: item.me ? "#000" : colors.gray6,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  alignContent: "center",
                                  justifyContent: "center",
                                  paddingVertical: 2,
                                  paddingHorizontal: 8,
                                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                                  borderRadius: 16,
                                }}
                              >
                                <Text style={{ color: "#fff", fontSize: 12 }}>
                                  <Moment element={Text} unix format="HH:mm">
                                    {item.timestamp}
                                  </Moment>
                                </Text>

                                {item.me && item.seen ? (
                                  <MaterialCommunityIcons
                                    name="check-all"
                                    size={16}
                                    color={"#fff"}
                                    style={{ marginLeft: 2 }}
                                  />
                                ) : item.me ? (
                                  <MaterialCommunityIcons
                                    name="check"
                                    size={16}
                                    color={"#fff"}
                                    style={{ marginLeft: 2 }}
                                  />
                                ) : null}
                              </View>
                            </ImageBackground>
                          ) : (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "flex-end",
                              }}
                            >
                              <Text
                                style={[
                                  {
                                    color: item.me ? "#fff" : "#000",
                                    maxWidth:
                                      Dimensions.get("window").width - 140,
                                  },
                                  item.link
                                    ? {
                                        textDecorationLine: "underline",
                                        textDecorationStyle: "solid",
                                        textDecorationColor: "#fff",
                                      }
                                    : null,
                                ]}
                              >
                                {item.message}
                              </Text>

                              <Text
                                style={{
                                  color: colors.gray,
                                  fontSize: 12,
                                  marginLeft: 8,
                                }}
                              >
                                <Moment element={Text} unix format="HH:mm">
                                  {item.timestamp}
                                </Moment>
                              </Text>

                              {item.me && item.seen ? (
                                <MaterialCommunityIcons
                                  name="check-all"
                                  size={16}
                                  color={colors.gray}
                                  style={{
                                    alignSelf: "flex-end",
                                    marginLeft: 2,
                                  }}
                                />
                              ) : item.me ? (
                                <MaterialCommunityIcons
                                  name="check"
                                  size={16}
                                  color={colors.gray}
                                  style={{
                                    alignSelf: "flex-end",
                                    marginLeft: 2,
                                  }}
                                />
                              ) : null}
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
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
                <Text
                  style={{ color: "#000", fontSize: 16, fontWeight: "bold" }}
                >
                  Повідомлень ще немає...
                </Text>
                <Text style={{ color: colors.gray }}>
                  Напишіть повідомлення
                </Text>
                <TouchableOpacity
                  onPress={() => input.current.focus()}
                  style={{ marginTop: 8 }}
                >
                  <Text
                    style={{
                      color: colors.blue,
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Написати
                  </Text>
                </TouchableOpacity>
              </View>
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
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
                onPress={sendAttachment}
              >
                <MaterialCommunityIcons
                  name="attachment"
                  size={28}
                  color={colors.gray}
                  style={{ transform: [{ rotate: "-45deg" }] }}
                />
              </TouchableOpacity>
              <TextInput
                style={{
                  borderColor: colors.gray6,
                  borderWidth: 2,
                  borderRadius: 16,
                  paddingTop: Platform.OS === "ios" ? 10 : 4,
                  paddingBottom: Platform.OS === "ios" ? 10 : 4,
                  paddingHorizontal: 16,
                  marginLeft: 0,
                  flex: 1,
                  minHeight: 40,
                }}
                placeholder="Повідомлення..."
                onChangeText={(message) => {
                  setInputMessage(message);
                  typing();
                }}
                ref={input}
                selectionColor="#000"
                multiline={true}
              />
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
                onPress={() => sendMessage()}
              >
                <MaterialCommunityIcons
                  name="send"
                  size={28}
                  color={colors.blue}
                />
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
