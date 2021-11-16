import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
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
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import uuid from "uuid";

// Styles
import colors from "../../styles/colors";
// Firebase
import { firebase, db, auth } from "../../firebase";
// Components
import LoadingScreen from "../../components/LoadingScreen";

export default function ChatsCreateGroupScreen({ navigation, route }) {
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const input = useRef(null);

  // Navigation
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={createGroup}
          disabled={groupName.trim().length === 0}
        >
          <Text
            style={{
              color: groupName.trim().length > 0 ? colors.blue : colors.gray,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Створити
          </Text>
        </TouchableOpacity>
      ),
    });
  });

  // Init
  useEffect(() => {
    // Get users
    const usersSnapshotUnsubscribe = db
      .collection("users")
      .where("userId", "in", route.params.members)
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          setUsers(
            snapshot.docs.map((user) => {
              return { ...user.data(), id: user.id };
            })
          );
        }

        setLoading(false);

        if (!input.current.isFocused()) {
          setTimeout(() => {
            input.current.focus();
          }, 500);
        }
      });

    return () => {
      usersSnapshotUnsubscribe();
    };
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.cancelled) {
      const manipResult = await ImageManipulator.manipulateAsync(result.uri, [
        {
          resize: {
            width: 256,
            height: 256,
          },
        },
      ]);
      setGroupPhoto(manipResult.uri);
    }
  };

  const createGroup = async () => {
    setLoading(true);

    const fromMeId = auth.currentUser?.uid;
    const fromMeInfo = await db.collection("users").doc(fromMeId).get();

    // Create group in chats
    const newGroupRef = await db.collection("chats").add({
      group: true,
      adminId: fromMeId,
      groupMessage: `${fromMeInfo.data().name} створює групу`,
      groupMessageSenderId: fromMeId,
      groupMessageSenderName: fromMeInfo.data().name,
      groupSystemMessage: true,
      groupName: groupName,
      groupPhoto: "",
      members: [fromMeId, ...route.params.members],
      timestamp: firebase.firestore.Timestamp.now(),
      unreadCount: Object.fromEntries(
        [fromMeId, ...route.params.members].map((id) => [id, 1])
      ),
    });

    // Send message
    await newGroupRef.collection("messages").add({
      message: `${fromMeInfo.data().name} створює групу`,
      systemMessage: true,
      timestamp: firebase.firestore.Timestamp.now(),
      seen: false,
      userId: fromMeId,
      userName: fromMeInfo.data().name,
      userPhoto: fromMeInfo.data().photo,
    });

    // Add members to group
    for (const userId of [fromMeId, ...route.params.members]) {
      const userInfo = await db.collection("users").doc(userId).get();

      await newGroupRef
        .collection("members")
        .doc(userId)
        .set({
          ...userInfo.data(),
          admin: userId === fromMeId,
        });
    }

    // Add photo
    if (groupPhoto !== null) {
      const response = await fetch(groupPhoto);
      const blob = await response.blob();

      // Add new photo
      const snapshot = await firebase
        .storage()
        .ref()
        .child(`${auth.currentUser?.uid}/groups/${newGroupRef.id}/${uuid.v4()}`)
        .put(blob);

      const url = await snapshot.ref.getDownloadURL();

      // Update photo
      await newGroupRef.update({
        groupPhoto: url,
      });
    }

    navigation.popToTop();
    navigation.navigate("ChatsMessages", { groupId: newGroupRef.id });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray6 }}>
      <StatusBar style="auto" />

      {!loading ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  backgroundColor: "#fff",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray6,
                  marginBottom: 16,
                }}
              >
                <TouchableOpacity onPress={pickImage}>
                  <ImageBackground
                    source={
                      groupPhoto !== null
                        ? { uri: groupPhoto, cache: "force-cache" }
                        : null
                    }
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 64,
                      padding: 16,
                      backgroundColor: colors.blue,
                    }}
                    imageStyle={{ borderRadius: 64 }}
                  >
                    {groupPhoto === null ? (
                      <MaterialCommunityIcons
                        name="camera-plus"
                        size={32}
                        color="#fff"
                      />
                    ) : null}
                  </ImageBackground>
                </TouchableOpacity>

                <TextInput
                  placeholder="Назва групи"
                  style={{
                    paddingVertical: 8,
                    fontSize: 16,
                    flex: 1,
                    marginLeft: 16,
                  }}
                  selectionColor="#000"
                  onChangeText={setGroupName}
                  underlineColorAndroid={colors.gray6}
                  ref={input}
                />
              </View>

              <View
                style={{
                  backgroundColor: "#fff",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontSize: 20 }}>Учасники</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                paddingVertical: 8,
                paddingHorizontal: 16,
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: colors.gray6,
                backgroundColor: "#fff",
              }}
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
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {item.name}
                </Text>
                <Text style={{ color: colors.gray }}>{item.phone}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <LoadingScreen />
      )}
    </View>
  );
}
