import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
  ImageBackground,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons } from "@expo/vector-icons";
import "moment/locale/uk";
import Moment from "react-moment";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db, auth } from "../../firebase";

export default function EditScreen({ route, navigation }) {
  //   useEffect(() => {
  //     // DB

  //   }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Редагувати",
      headerRight: () => (
        <TouchableOpacity onPress={() => console.log(route)}>
          <Ionicons name="checkmark-sharp" size={26} color="#000" />
        </TouchableOpacity>
      ),
    });
  });

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View flexDirection="row" style={{ padding: 15 }}>
        <TouchableOpacity>
          <ImageBackground
            source={{ uri: route.params.userPhoto }}
            style={styles.profile_photo}
            imageStyle={{ borderRadius: 40 }}
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
            // placeholder = "Ім'я"
            style={styles.input}
            editable={true}
            defaultValue={route.params.userName}
            selectionColor="#000"
          />

          <TextInput
            // placeholder = "Про себе"
            style={[styles.input, { marginTop: 5 }]}
            defaultValue={route.params.userBio}
            selectionColor="#000"
          />
        </View>
      </View>
    </View>
  );
}
