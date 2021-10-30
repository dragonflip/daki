import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons } from "@expo/vector-icons"
import Constants from "expo-constants";
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
          <TouchableOpacity onPress = {() => console.log(route)}>
            <Ionicons name="checkmark-sharp" size={26} color="#000" />
          </TouchableOpacity>
        ),
    });
  });

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View flexDirection="row" style = {{padding : 15}}>
        <TouchableOpacity>
          <View style={[styles.profile_photo, { backgroundColor: "#aaa" }]}>
          <Feather
          name = "camera"
          size = {32}
          />
         </View>
        </TouchableOpacity>

        <View style={{marginLeft: 10}}>
          <TextInput style = {styles.input} editable={true} defaultValue = {route.params.userName} />
          <TextInput style = {[styles.input, {marginTop: 5}]} defaultValue = {route.params.userBio} />
        </View>
      </View>
    </View>
  );
}
