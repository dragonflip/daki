import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ImageBackground,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import uuid from "uuid";
import "moment/locale/uk";
import Moment from "react-moment";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db, auth } from "../../firebase";

export default function EditScreen({ route, navigation }) {
  const [image, setImage] = useState(null);
  const [newName, setNewName] = useState(route.params.userName);
  const [newBio, setNewBio] = useState(route.params.userBio);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Редагувати",
      headerRight: () => (
        <TouchableOpacity onPress={() => updateInfo(image)}>
          <Ionicons name="checkmark-sharp" size={26} color="#000" />
        </TouchableOpacity>
      ),
    });
  });

  function updateInfo(uri) {
    if (uri != null) uploadImageAsync(uri);
    else {
      db.collection("users").doc(auth.currentUser?.uid).update({
        name: newName,
        bio: newBio,
      });

      db.collection("chats")
        .where("members", "array-contains", auth.currentUser?.uid)
        .orderBy("timestamp", "desc")
        .get()
        .then((chats) => {
          chats.docs.forEach(async (chat) => {
            const fromMeId = auth.currentUser?.uid;
            const toMeId = chat
              .data()
              .members.filter((member) => member != fromMeId)[0];

            await chat.ref.update({
              name: {
                [fromMeId]: newName,
                [toMeId]: chat.data().name[toMeId],
              },
            });
          });
        });

      navigation.goBack();
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  async function uploadImageAsync(uri) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const ref = firebase.storage().ref().child(uuid.v4());
    const snapshot = await ref.put(blob);

    // We're done with the blob, close and release it
    blob.close();

    let url = await snapshot.ref.getDownloadURL();

    db.collection("users").doc(auth.currentUser?.uid).update({
      name: newName,
      bio: newBio,
      profilePhoto: url,
    });

    db.collection("chats")
      .where("members", "array-contains", auth.currentUser?.uid)
      .orderBy("timestamp", "desc")
      .get()
      .then((chats) => {
        chats.docs.forEach(async (chat) => {
          const fromMeId = auth.currentUser?.uid;
          const toMeId = chat
            .data()
            .members.filter((member) => member != fromMeId)[0];

          await chat.ref.update({
            name: {
              [fromMeId]: newName,
              [toMeId]: chat.data().name[toMeId],
            },
            photo: {
              [fromMeId]: url,
              [toMeId]: chat.data().photo[toMeId],
            },
          });
        });
      });

    navigation.goBack();
    return url;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View flexDirection="row" style={{ padding: 15 }}>
        <TouchableOpacity onPress={pickImage}>
          <ImageBackground
            source={
              image != "" ? { uri: image } : { uri: route.params.userPhoto }
            }
            imageStyle={{ borderRadius: 40 }}
            style={{ width: 96, height: 96 }}
          >
            <Feather
              name="camera"
              size={32}
              style={{
                backgroundColor: "rgba(211, 211, 211, 0.5)",
                padding: 19,
                borderRadius: 40,
              }}
            />
          </ImageBackground>
        </TouchableOpacity>

        <View style={{ marginLeft: 10 }}>
          <TextInput
            placeholder="Ім'я"
            onChangeText={(name) => setNewName(name)}
            defaultValue={route.params.userName}
          />

          <TextInput
            placeholder="Про себе"
            onChangeText={(bio) => setNewBio(bio)}
            defaultValue={route.params.userBio}
          />
        </View>
      </View>
    </View>
  );
}
