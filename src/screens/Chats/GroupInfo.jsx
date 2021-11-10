import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import "moment/locale/uk";
import Moment from "react-moment";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db, auth } from "../../firebase";

export default function ChatGroupInfoScreen({ route, navigation }) {
  const [groupInfo, setGroupInfo] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Init
  useEffect(() => {
    // Get group info
    const groupSnapshotUnsubscribe = db
      .collection("chats")
      .doc(route.params.chatId)
      .onSnapshot((snapshot) => {
        setGroupInfo({
          ...snapshot.data(),
          membersCount: snapshot.data().members.length,
        });
        setLoading(false);
      });

    const membersSnapshotUnsubscribe = db
      .collection("chats")
      .doc(route.params.chatId)
      .collection("members")
      .orderBy("admin", "desc")
      .onSnapshot((snapshot) => {
        setMembers(
          snapshot.docs.map((doc) => {
            return {
              ...doc.data(),
              id: doc.id,
            };
          })
        );
      });

    return () => {
      groupSnapshotUnsubscribe();
      membersSnapshotUnsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {!loading ? (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <View>
              {groupInfo.groupPhoto !== "" ? (
                <Image
                  source={{
                    uri: groupInfo.groupPhoto,
                  }}
                  style={{
                    width: 192,
                    height: 192,
                    borderRadius: 192,
                    alignSelf: "center",
                    marginTop: 64,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: Dimensions.get("window").width,
                    height: Dimensions.get("window").width,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#eee",
                  }}
                >
                  <Ionicons
                    name="camera"
                    size={Dimensions.get("window").width * 0.4}
                    color="#aaa"
                  />
                </View>
              )}

              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingTop: 16,
                  }}
                >
                  <View style={{ flex: 1, paddingBottom: 16 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>
                        {groupInfo.groupName}
                      </Text>
                    </View>

                    <Text style={{ color: "grey", textAlign: "center" }}>
                      Учасників: {groupInfo.membersCount}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{
                    borderWidth: 1,
                    borderColor: "#eee",
                    borderRadius: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons name="send" size={14} color="blue" />
                  <Text style={{ color: "blue", fontSize: 14, marginLeft: 4 }}>
                    Написати повідомлення
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: "#eee",
                    borderRadius: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    marginTop: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons name="logout" size={14} color="red" />
                  <Text style={{ color: "red", fontSize: 14, marginLeft: 4 }}>
                    Вийти з групи
                  </Text>
                </TouchableOpacity>

                <Text
                  style={{ fontSize: 20, fontWeight: "300", marginTop: 16 }}
                >
                  Учасники
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                borderBottomWidth: 1,
                borderColor: "#eee",
                padding: 8,
                alignItems: "center",
              }}
              activeOpacity={0.5}
              onPress={() =>
                navigation.navigate("ChatsUserInfo", { userId: item.id })
              }
            >
              {item.profilePhoto !== "" ? (
                <Image
                  source={{ uri: item.profilePhoto }}
                  style={{ width: 48, height: 48, borderRadius: 48 }}
                />
              ) : (
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 48,
                    backgroundColor: "#aaa",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 18, color: "#fff" }}>
                    {item.name[0]}
                  </Text>
                </View>
              )}
              <View style={{ marginLeft: 8, flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                  {item.admin ? (
                    <Text style={{ color: "blue", fontSize: 12 }}>адмін</Text>
                  ) : null}
                </View>

                {item.online.seconds >
                firebase.firestore.Timestamp.now().seconds + 10 ? (
                  <Text style={{ color: "green", fontSize: 12 }}>онлайн</Text>
                ) : (
                  <Text style={{ color: "grey", fontSize: 12 }}>
                    в мережі{" "}
                    <Moment element={Text} locale="uk" fromNow unix>
                      {item.online?.seconds}
                    </Moment>
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <ActivityIndicator
          color="#000"
          style={{ flex: 1 }}
          size={Platform.OS === "android" ? "large" : "small"}
        />
      )}
    </View>
  );
}
