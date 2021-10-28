import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Feather, Octicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import "moment/locale/uk";
import Moment from "react-moment";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db, auth } from "../../firebase";

export default function SearchScreen({ navigation }) {
  const [number, setNumber] = useState();


  // Get data from storage
  useEffect(() => {
    // Get user profile
    // const unsubscribeSnaphot = db
    //   .collection("users")
    //   .doc(route.params.userId)
    //   .onSnapshot((snapshot) => {
    //     setProfile(snapshot.data());
    //   });

    navigation.setOptions({
        headerTitle: () => (
            <TextInput 
            autoFocus = {true}
            style={styles.input}
            placeholder="Пошук"
            //onChangeText={searchUser}
            />
          ),
      
    });

    //return unsubscribeSnaphot;
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
        
    </View>
  );
}
