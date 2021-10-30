import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image
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
  const [users, setUsers] = useState([]);
  const [shouldShow, setShouldShow] = useState(false);
  const [rightUserIndex, setRightUserIndex] = useState(0);
  const input = useRef(null);

  useEffect(() => {
    // Select other users
    const usersSnapshotUnsubscribe = db
      .collection("users")
      .onSnapshot((snapshot) => {
        setUsers(
          snapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
          })
        );
      });
      
    setTimeout(() => input.current.focus(), 500);

    return () => {
      usersSnapshotUnsubscribe();
    };

  }, []);
  
  useLayoutEffect(() => {
    navigation.setOptions({
        headerTitle: () => (
            <TextInput 
            style={styles.input}
            placeholder="Пошук"
            keyboardType="phone-pad"
            defaultValue="+380"
            ref={input}
            maxLength={13}
            onChangeText={number => findUser(number)}
            />
          ),
    });
  });

  function findUser(number) {
    for(let i = 0; i < users.length; i++)
    {
      if(number === users[i].phone) {setShouldShow(true); setRightUserIndex(i); break;} else {setShouldShow(false);}
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {shouldShow ? (
      <TouchableOpacity style={styles.chat} activeOpacity={0.5}>
        <View style={[styles.chat_photo, { backgroundColor: "#aaa" }]}>
          <Text style={{ fontSize: 24, color: "#fff" }}>
          {users[rightUserIndex].name[0]}
          </Text>
        </View>


        <View style={styles.chat_info}>
          <View style={styles.chat_name_date_status}>
            <Text style={styles.profile_name}>
            {users[rightUserIndex].name}
            </Text>
          </View>
            <Text style={{color: "#0000FF"}} >
              {users[rightUserIndex].phone}
            </Text>
        </View>
      </TouchableOpacity>
      ) : null}
    </View>
  );
  
}
