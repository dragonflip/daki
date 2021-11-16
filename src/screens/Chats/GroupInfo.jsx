import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  Alert,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import Moment from "react-moment";

// Styles
import colors from "../../styles/colors";
// Firebase
import { firebase, db, auth } from "../../firebase";
// Components
import LoadingScreen from "../../components/LoadingScreen";

export default function ChatsGroupInfoScreen({ navigation, route }) {
  const [group, setGroup] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Init
  useEffect(() => {
    // Get group info
    const groupSnapshotUnsubscribe = db
      .collection("chats")
      .doc(route.params.groupId)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          setGroup({
            ...snapshot.data(),
            membersCount: snapshot.data().members.length,
            admin: snapshot.data().adminId === auth.currentUser?.uid,
          });
        }
      });

    // Get members
    const membersSnapshotUnsubscribe = db
      .collection("chats")
      .doc(route.params.groupId)
      .collection("members")
      .orderBy("online", "desc")
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          setMembers(
            snapshot.docs.map((doc) => {
              return {
                ...doc.data(),
                id: doc.id,
                me: auth.currentUser?.uid === doc.id,
              };
            })
          );
          setLoading(false);
        }
      });

    return () => {
      groupSnapshotUnsubscribe();
      membersSnapshotUnsubscribe();
    };
  }, []);

  const deleteGroup = async () => {
    Alert.alert("Видалити групу?", "Групу буде видалено для всіх", [
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
            .doc(route.params.groupId)
            .collection("messages")
            .get();

          for (const message of messages.docs) {
            await message.ref.delete();
          }

          // Delete members
          const members = await db
            .collection("chats")
            .doc(route.params.groupId)
            .collection("members")
            .get();

          for (const member of members.docs) {
            await member.ref.delete();
          }

          // Delete chat
          await db.collection("chats").doc(route.params.groupId).delete();

          navigation.navigate("Chats");
        },
      },
    ]);
  };

  const leaveGroup = async () => {
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

            // Add system message about member left
            const leaverInfo = await db
              .collection("users")
              .doc(auth.currentUser?.uid)
              .get();

            await db
              .collection("chats")
              .doc(route.params.groupId)
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
              .doc(route.params.groupId)
              .update({
                groupMessage: `${leaverInfo.data().name} покидає групу`,
                groupMessageSenderId: auth.currentUser?.uid,
                groupSystemMessage: true,
                timestamp: firebase.firestore.Timestamp.now(),
              });

            // Delete from members collection
            await db
              .collection("chats")
              .doc(route.params.groupId)
              .collection("members")
              .doc(auth.currentUser?.uid)
              .delete();

            // Delete from members chat array
            await db
              .collection("chats")
              .doc(route.params.groupId)
              .update({
                members: firebase.firestore.FieldValue.arrayRemove(
                  auth.currentUser?.uid
                ),
              });

            navigation.navigate("Chats");
          },
        },
      ]
    );
  };

  const kickMember = async (userId) => {
    Alert.alert(
      "Видалити учасника?",
      "Його повідомлення залишаться, і Ви зможете повторно його додати",
      [
        {
          text: "Скасувати",
          style: "cancel",
        },
        {
          text: "Видалити",
          style: "destructive",
          onPress: async () => {
            // Add system message about kicked member
            const leaverInfo = await db.collection("users").doc(userId).get();
            const adminInfo = await db
              .collection("users")
              .doc(auth.currentUser?.uid)
              .get();

            await db
              .collection("chats")
              .doc(route.params.groupId)
              .collection("messages")
              .add({
                message: `${adminInfo.data().name} виключає ${
                  leaverInfo.data().name
                } з групи`,
                systemMessage: true,
                timestamp: firebase.firestore.Timestamp.now(),
                userId: auth.currentUser?.uid,
              });

            // Update chat system message
            await db
              .collection("chats")
              .doc(route.params.groupId)
              .update({
                groupMessage: `${adminInfo.data().name} виключає ${
                  leaverInfo.data().name
                } з групи`,
                groupMessageSenderId: auth.currentUser?.uid,
                groupSystemMessage: true,
                timestamp: firebase.firestore.Timestamp.now(),
              });

            // Delete from members collection
            await db
              .collection("chats")
              .doc(route.params.groupId)
              .collection("members")
              .doc(userId)
              .delete();

            // Delete from members chat array
            await db
              .collection("chats")
              .doc(route.params.groupId)
              .update({
                members: firebase.firestore.FieldValue.arrayRemove(userId),
              });
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray6 }}>
      <StatusBar style="auto" />

      {!loading ? (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View>
              <View
                style={{
                  backgroundColor: "#fff",
                  paddingBottom: 16,
                }}
              >
                <ImageBackground
                  source={
                    group.groupPhoto !== ""
                      ? { uri: group.groupPhoto, cache: "force-cache" }
                      : null
                  }
                  style={{
                    width: 192,
                    height: 192,
                    borderRadius: 192,
                    backgroundColor: colors.gray,
                    alignSelf: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 64,
                  }}
                  imageStyle={{ borderRadius: 192 }}
                >
                  {group.groupPhoto === "" ? (
                    <Text
                      style={{
                        fontSize: 48,
                        color: "#fff",
                        includeFontPadding: false,
                      }}
                    >
                      {group.groupName[0]}
                    </Text>
                  ) : null}
                </ImageBackground>

                <View style={{ alignItems: "center", marginTop: 8 }}>
                  <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                    {group.groupName}
                  </Text>

                  <Text style={{ color: colors.gray }}>
                    учасників: {group.membersCount}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  marginTop: 16,
                  paddingHorizontal: 16,
                  backgroundColor: "#fff",
                }}
              >
                {group.admin ? (
                  <View>
                    <TouchableOpacity
                      style={{
                        paddingVertical: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        borderBottomWidth: 1,
                        borderBottomColor: colors.gray6,
                      }}
                      onPress={() =>
                        navigation.navigate("ChatsGroupEdit", {
                          ...route.params,
                        })
                      }
                    >
                      <MaterialCommunityIcons
                        name="pencil"
                        size={20}
                        color={colors.blue}
                      />
                      <Text
                        style={{
                          color: colors.blue,
                          fontSize: 16,
                          marginLeft: 12,
                        }}
                      >
                        Редагувати назву та фото
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        paddingVertical: 12,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                      onPress={deleteGroup}
                    >
                      <MaterialCommunityIcons
                        name="delete"
                        size={20}
                        color={colors.red}
                      />
                      <Text
                        style={{
                          color: colors.red,
                          fontSize: 16,
                          marginLeft: 12,
                        }}
                      >
                        Видалити групу
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    onPress={leaveGroup}
                  >
                    <MaterialCommunityIcons
                      name="logout"
                      size={20}
                      color={colors.red}
                    />
                    <Text
                      style={{
                        color: colors.red,
                        fontSize: 16,
                        marginLeft: 12,
                      }}
                    >
                      Покинути групу
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View
                style={{
                  marginTop: 16,
                  paddingHorizontal: 16,
                  backgroundColor: "#fff",
                }}
              >
                <Text style={{ fontSize: 20, marginVertical: 12 }}>
                  Учасники
                </Text>
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.gray6,
                  }}
                  onPress={() =>
                    navigation.navigate("ChatsGroupAddMembers", {
                      ...route.params,
                    })
                  }
                >
                  <MaterialCommunityIcons
                    name="account-plus"
                    size={20}
                    color={colors.blue}
                  />
                  <Text
                    style={{ color: colors.blue, fontSize: 16, marginLeft: 12 }}
                  >
                    Додати учасника
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                borderBottomWidth: 1,
                borderColor: colors.gray6,
                paddingHorizontal: 16,
                paddingVertical: 8,
                alignItems: "center",
                backgroundColor: "#fff",
              }}
              activeOpacity={0.5}
              onPress={() =>
                item.userId !== auth.currentUser?.uid
                  ? navigation.navigate("ChatsUserInfo", { userId: item.id })
                  : navigation.navigate("MyProfile")
              }
            >
              <ImageBackground
                source={
                  item.photo !== ""
                    ? { uri: item.photo, cache: "force-cache" }
                    : null
                }
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 48,
                  backgroundColor: colors.gray,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                imageStyle={{ borderRadius: 48 }}
              >
                {item.photo === "" ? (
                  <Text
                    style={{
                      fontSize: 24,
                      color: "#fff",
                      includeFontPadding: false,
                    }}
                  >
                    {item.name[0]}
                  </Text>
                ) : null}
              </ImageBackground>

              <View style={{ marginLeft: 8, flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                    {item.name}
                  </Text>
                  {item.admin ? (
                    <Text
                      style={{
                        color: "#000",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      адмін
                    </Text>
                  ) : null}
                </View>

                {item.online.seconds >
                firebase.firestore.Timestamp.now().seconds + 10 ? (
                  <Text style={{ color: "green", fontSize: 12 }}>у мережі</Text>
                ) : (
                  <Text style={{ color: colors.gray, fontSize: 12 }}>
                    у мережі{" — "}
                    <Moment
                      element={Text}
                      format={
                        moment
                          .unix(moment().unix())
                          .isSame(moment.unix(item.online?.seconds), "date")
                          ? "HH:mm"
                          : "DD.MM.YYYY в HH:mm"
                      }
                      unix
                    >
                      {item.online?.seconds}
                    </Moment>
                  </Text>
                )}
              </View>

              {!item.me && group.admin ? (
                <TouchableOpacity
                  style={{ padding: 8 }}
                  onPress={() => kickMember(item.userId)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={colors.gray}
                  />
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          )}
        />
      ) : (
        <LoadingScreen />
      )}
    </View>
  );
}
