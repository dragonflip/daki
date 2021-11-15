import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import uuid from "uuid";

// Styles
import colors from "../../styles/colors";
// Firebase
import { firebase, db } from "../../firebase";
// Components
import KeyboardAvoider from "../../components/KeyboardAvoider";

export default function ChatsGroupEditScreen({ navigation, route }) {
  const [image, setImage] = useState(null);
  const [group, setGroup] = useState([]);
  const [newGroupName, setNewGroupName] = useState(null);
  const [loading, setLoading] = useState(false);

  // Navigation
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () =>
        Platform.OS === "ios" ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.blue, fontSize: 16 }}>Скасувати</Text>
          </TouchableOpacity>
        ) : null,
      headerRight: () => (
        <TouchableOpacity onPress={updateGroup}>
          <Text
            style={{ color: colors.blue, fontSize: 16, fontWeight: "bold" }}
          >
            Зберегти
          </Text>
        </TouchableOpacity>
      ),
    });
  });

  // Init
  useEffect(() => {
    const groupSnapshotUnsubscribe = db
      .collection("chats")
      .doc(route.params.groupId)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          setGroup(snapshot.data());
        }
      });

    return groupSnapshotUnsubscribe;
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
      setImage(manipResult.uri);
    }
  };

  const updateGroup = async () => {
    let url = null;
    setLoading(true);

    if (image !== null) {
      if (image !== "") {
        const response = await fetch(image);
        const blob = await response.blob();

        const ref = firebase.storage().ref().child(uuid.v4());
        const snapshot = await ref.put(blob);

        url = await snapshot.ref.getDownloadURL();
      } else {
        url = "";
      }

      console.log(url);
    }

    // Update group
    await db
      .collection("chats")
      .doc(route.params.groupId)
      .update({
        groupName: newGroupName ?? group.groupName,
        groupPhoto: url ?? group.groupPhoto,
      });

    setLoading(false);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray6 }}>
      <StatusBar style="auto" />

      <ScrollView>
        <KeyboardAvoider style={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
            style={{ alignSelf: "center", alignItems: "center" }}
            onPress={pickImage}
          >
            <ImageBackground
              source={
                image !== null && image !== ""
                  ? { uri: image, cache: "force-cache" }
                  : group.groupPhoto !== "" && image !== ""
                  ? { uri: group.groupPhoto, cache: "force-cache" }
                  : null
              }
              style={{
                width: 192,
                height: 192,
                borderRadius: 192,
                backgroundColor: "#ccc",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 64,
              }}
              imageStyle={{ borderRadius: 192 }}
            >
              {!loading ? (
                <View
                  style={{
                    flex: 1,
                    alignSelf: "stretch",
                    borderRadius: 192,
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={48}
                    color="#fff"
                  />
                </View>
              ) : (
                <ActivityIndicator color="#fff" />
              )}
            </ImageBackground>
          </TouchableOpacity>

          {(image !== null && image !== "") ||
          (group.groupPhoto !== "" && image !== "") ? (
            <TouchableOpacity
              style={{ alignSelf: "center", alignItems: "center" }}
              onPress={() => setImage("")}
            >
              <Text style={{ color: colors.red, fontSize: 16, marginTop: 8 }}>
                Видалити фото
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{ alignSelf: "center", alignItems: "center" }}
              onPress={pickImage}
            >
              <Text style={{ color: colors.blue, fontSize: 16, marginTop: 8 }}>
                Встановити нове фото
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ marginTop: 8 }}>
            <TextInput
              style={{
                width: "100%",
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginTop: 8,
                fontSize: 16,
                borderWidth: 2,
                borderColor: colors.gray5,
                borderRadius: 16,
                backgroundColor: "#fff",
              }}
              selectionColor="#000"
              defaultValue={group.groupName}
              placeholder="Ім'я"
              onChangeText={setNewGroupName}
            />
            <Text style={{ marginLeft: 8, color: colors.gray, fontSize: 12 }}>
              Назва групи
            </Text>
          </View>
        </KeyboardAvoider>
      </ScrollView>
    </View>
  );
}
