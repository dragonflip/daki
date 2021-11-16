import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  TextInput,
  Platform,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Styles
import colors from "../../styles/colors";
// Firebase
import { firebase, db, auth } from "../../firebase";
// Components
import LoadingScreen from "../../components/LoadingScreen";

export default function ChatsGroupAddMembersScreen({ navigation, route }) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Navigation
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: route.params.createGroup
        ? "Оберіть учасників"
        : "Додати учасників",
      headerRight: () => (
        <TouchableOpacity
          onPress={
            route.params.createGroup
              ? () =>
                  navigation.navigate("ChatsCreateGroup", {
                    members: selectedUsers,
                  })
              : addMembers
          }
          disabled={selectedUsers.length === 0}
        >
          <Text
            style={{
              color: selectedUsers.length > 0 ? colors.blue : colors.gray,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            {route.params.createGroup ? "Далі" : "Додати"}
          </Text>
        </TouchableOpacity>
      ),
      headerSearchBarOptions: {
        placeholder: "Пошук людей...",
        hideWhenScrolling: false,
        onChangeText: (event) => setSearch(event.nativeEvent.text),
      },
    });
  });

  // Init
  useEffect(() => {
    // Get users
    const usersSnapshotUnsubscribe = db
      .collection("users")
      .where("userId", "!=", auth.currentUser?.uid)
      .onSnapshot(async (snapshot) => {
        if (!snapshot.empty) {
          setUsers(
            await Promise.all(
              snapshot.docs.map(async (user) => {
                const member = await db
                  .collection("chats")
                  .doc(route.params.groupId)
                  .collection("members")
                  .doc(user.id)
                  .get();

                return { ...user.data(), id: user.id, member: member.exists };
              })
            )
          );
        }

        setLoading(false);
      });

    return () => {
      usersSnapshotUnsubscribe();
    };
  }, []);

  const addMembers = async () => {
    setLoading(true);

    for (const selectedUser of selectedUsers) {
      // Get user info
      const userInfo = await db.collection("users").doc(selectedUser).get();

      // Add to members collection
      await db
        .collection("chats")
        .doc(route.params.groupId)
        .collection("members")
        .doc(userInfo.id)
        .set({ ...userInfo.data() });

      // Add to members chat array
      await db
        .collection("chats")
        .doc(route.params.groupId)
        .update({
          members: firebase.firestore.FieldValue.arrayUnion(userInfo.id),
        });

      // Update old name and photo in messages
      const prevMessages = await db
        .collection("chats")
        .doc(route.params.groupId)
        .collection("messages")
        .where("userId", "==", userInfo.id)
        .get();

      for (const message of prevMessages.docs) {
        message.ref.update({
          userName: userInfo.data().name,
          userPhoto: userInfo.data().photo,
        });
      }
    }

    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray6 }}>
      <StatusBar style="auto" />

      {!loading ? (
        <FlatList
          data={users.filter(
            (item) =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.phone.toLowerCase().includes(search.toLowerCase())
          )}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            Platform.OS === "android" ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingLeft: 16,
                  backgroundColor: "#fff",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray6,
                }}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color={colors.gray}
                />
                <TextInput
                  placeholder="Пошук людей..."
                  style={{
                    backgroundColor: "#fff",
                    paddingRight: 16,
                    paddingLeft: 8,
                    paddingVertical: 8,
                    fontSize: 16,
                    flex: 1,
                  }}
                  selectionColor="#000"
                  onChangeText={setSearch}
                />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                paddingVertical: 8,
                paddingHorizontal: 16,
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: colors.gray6,
                backgroundColor: "#fff",
              }}
              activeOpacity={0.5}
              onPress={() =>
                setSelectedUsers(
                  selectedUsers.includes(item.userId)
                    ? selectedUsers.filter((userId) => userId !== item.userId)
                    : [...selectedUsers, item.userId]
                )
              }
              disabled={item.member}
            >
              <View style={{ marginRight: 16 }}>
                {item.member ? (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={colors.gray}
                  />
                ) : selectedUsers.includes(item.userId) ? (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={colors.blue}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="checkbox-blank-circle-outline"
                    size={24}
                    color={colors.blue}
                  />
                )}
              </View>

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
                      color: "#fff",
                      fontSize: 24,
                      includeFontPadding: false,
                    }}
                  >
                    {item.name[0]}
                  </Text>
                ) : null}
              </ImageBackground>

              <View style={{ marginLeft: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {item.name}
                </Text>
                <Text style={{ color: colors.gray }}>{item.phone}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <LoadingScreen />
      )}
    </View>
  );
}
