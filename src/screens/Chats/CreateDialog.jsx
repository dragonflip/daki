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
import { db, auth } from "../../firebase";
// Components
import LoadingScreen from "../../components/LoadingScreen";

export default function ChatsCreateDialogScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Navigation
  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Пошук людей...",
        hideWhenScrolling: false,
        obscureBackground: false,
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
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          setUsers(
            snapshot.docs.map((user) => {
              return { ...user.data(), id: user.id };
            })
          );
        }

        setLoading(false);
      });

    return () => {
      usersSnapshotUnsubscribe();
    };
  }, []);

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
            <View>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: "#fff",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
                onPress={() =>
                  navigation.navigate("ChatsGroupAddMembers", {
                    createGroup: true,
                  })
                }
              >
                <MaterialCommunityIcons
                  name="account-supervisor"
                  size={20}
                  color={colors.blue}
                />
                <Text
                  style={{ color: colors.blue, fontSize: 16, marginLeft: 12 }}
                >
                  Нова група
                </Text>
              </TouchableOpacity>

              {Platform.OS === "android" ? (
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
              ) : null}
            </View>
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
                navigation.replace("ChatsMessages", { userId: item.userId })
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {item.name}
                  </Text>

                  {item.verified ? (
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={18}
                      color={colors.blue}
                      style={{ marginLeft: 2 }}
                    />
                  ) : null}
                </View>

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
