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
import { firebase, db, auth } from "../../firebase";
// Components
import KeyboardAvoider from "../../components/KeyboardAvoider";

export default function EditScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [profile, setProfile] = useState([]);
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
        <TouchableOpacity onPress={updateProfile}>
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
    const userSnapshotUnsubscribe = db
      .collection("users")
      .doc(auth.currentUser?.uid)
      .onSnapshot((snapshot) => {
        setProfile(snapshot.data());
      });

    return userSnapshotUnsubscribe;
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

  const updateProfile = async () => {
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

    // Update profile in users
    await db
      .collection("users")
      .doc(auth.currentUser?.uid)
      .update({
        name: profile.name,
        bio: profile.bio,
        photo: url ?? profile.photo,
      });

    // Update profile in chats
    const chats = await db
      .collection("chats")
      .where("members", "array-contains", auth.currentUser?.uid)
      .orderBy("timestamp", "desc")
      .get();

    for (const chat of chats.docs) {
      if (chat.data().group) {
        // Group
        await chat.ref
          .collection("members")
          .doc(auth.currentUser?.uid)
          .update({
            name: profile.name,
            bio: profile.bio,
            photo: url ?? profile.photo,
          });
      } else {
        // Dialog
        chat.ref.update({
          [`name.${auth.currentUser?.uid}`]: profile.name,
          [`photo.${auth.currentUser?.uid}`]: url ?? profile.photo,
        });
      }
    }

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
                image !== null
                  ? image !== ""
                    ? { uri: image }
                    : null
                  : profile.photo != ""
                  ? { uri: profile.photo }
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
          (profile.photo !== "" && image !== "") ? (
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
              defaultValue={profile.name}
              placeholder="Ім'я"
              onChangeText={(value) => (profile.name = value)}
            />
            <Text style={{ marginLeft: 8, color: colors.gray, fontSize: 12 }}>
              Ваше ім'я та/або прізвище
            </Text>

            <TextInput
              style={{
                width: "100%",
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginTop: 16,
                fontSize: 16,
                borderWidth: 2,
                borderColor: colors.gray5,
                borderRadius: 16,
                backgroundColor: colors.gray5,
              }}
              defaultValue={profile.phone}
              placeholder="Номер телефону"
              editable={false}
              onChangeText={(value) => (profile.phone = value)}
            />
            <Text style={{ marginLeft: 8, color: colors.gray, fontSize: 12 }}>
              На даний момент Ви не можете змінити номер телефону
            </Text>

            <TextInput
              style={{
                width: "100%",
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginTop: 16,
                fontSize: 16,
                borderWidth: 2,
                borderColor: colors.gray5,
                borderRadius: 16,
                backgroundColor: "#fff",
              }}
              defaultValue={profile.bio}
              placeholder="Про себе"
              onChangeText={(value) => (profile.bio = value)}
            />
            <Text style={{ marginLeft: 8, color: colors.gray, fontSize: 12 }}>
              Ваш опис про себе
            </Text>
          </View>
        </KeyboardAvoider>
      </ScrollView>
    </View>
  );
}
