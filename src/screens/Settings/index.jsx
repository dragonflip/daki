import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import { StatusBar } from "expo-status-bar";
import { Feather, Octicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {AlertBox} from 'react-native-alertbox';
import {fire} from 'react-native-alertbox';

// Styles
import styles from "./styles";
// Firebase
import { db, auth } from "../../firebase";

export default function SettingsScreen({ navigation }) {
  const [profile, setProfile] = useState({});
  const [photoRounded, setPhotoRounded] = useState(false);
  const [photoMultiplicator, setPhotoMultiplicator] = useState(1);
  const [userName, setUserName] = useState("Вадимко");

  // Get data from storage
  useEffect(() => {
    (async () => {
      // Get user profile
      const user = await db
        .collection("users")
        .where("userId", "==", auth.currentUser?.uid)
        .get();

      setProfile(user.docs.map((user) => user.data())[0]);
    })();
  }, []);

  // useFocusEffect(() => {
  //   console.log("Settings");
  // });

  //Change name
  function changeName(){
    fire({
      title: 'Зміна імені',
      message: 'Введіть нове імя: ',
      // buttons
      actions: [
        {
          text: 'Сквасувати',
          style: 'cancel',
        },
        {
          text: 'Підтвердити',
          onPress: (data) => setUserName(data.name) // It is an object that holds fields data
        },
      ],
      // fields
      fields: [
        {
          name: 'name',
          placeholder: 'Введіть імя',
        },
      ],
    });
  }

  // Logout
  async function logout() {
    await AsyncStorage.removeItem("phone");
    auth.signOut();

    navigation.replace("Phone");
  }

  const scrollHandler = (props) => {
    if (
      !photoRounded &&
      props.nativeEvent.contentOffset.y >= Dimensions.get("window").width / 3
    ) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPhotoRounded(true);
    } else if (
      photoRounded &&
      props.nativeEvent.contentOffset.y <= -(Dimensions.get("window").width / 4)
    ) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPhotoRounded(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <ScrollView
        onScrollEndDrag={Platform.OS === "ios" ? scrollHandler : null}
        onScroll={
          Platform.OS === "ios"
            ? (props) => {
                // console.log(
                //   1 -
                //     props.nativeEvent.contentOffset.y /
                //       Dimensions.get("window").width
                // );

                setPhotoMultiplicator(
                  1 -
                    props.nativeEvent.contentOffset.y /
                      Dimensions.get("window").width
                );
              }
            : null
        }
        scrollEventThrottle={16}
        style={photoRounded ? { paddingTop: 64 } : null}
      >
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1566275529824-cca6d008f3da?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fGNvdmVyJTIwcGhvdG98ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80",
          }}
          style={
            !photoRounded
              ? {
                  width: Dimensions.get("window").width * photoMultiplicator,
                  height: Dimensions.get("window").width,
                  alignSelf: "center",
                }
              : {
                  width: 128 * photoMultiplicator,
                  height: 128,
                  borderRadius: 128,
                  alignSelf: "center",
                }
          }
        />

        {/* <TouchableOpacity
          style={{
            width: 64,
            height: 64,
            borderRadius: 64,
            backgroundColor: "black",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: Dimensions.get("window").width - 32,
            right: 16,
            zIndex: 1,
          }}
        >
          <MaterialIcons name="add-a-photo" size={24} color="white" />
        </TouchableOpacity> */}

        <View style={{ paddingHorizontal: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingTop: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 24 }}>{userName}</Text>
                <Octicons
                  name="verified"
                  size={20}
                  color="blue"
                  style={{ marginLeft: 8 }}
                />
              </View>

              <Text style={{ color: "green", marginBottom: 16 }}>онлайн</Text>
            </View>

            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: "grey",
                borderRadius: 24,
                padding: 8,
              }}
              onPress = {changeName}
            >
              <Feather name="edit-3" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* <TouchableOpacity
            style={{
              paddingVertical: 16,
              borderColor: "#eee",
              borderTopWidth: 1,
            }}
          >
            <Text
              style={{
                color: "blue",
              }}
            >
              Редагувати профіль
            </Text>
          </TouchableOpacity> */}

          <View
            style={{
              paddingVertical: 16,
              borderColor: "#eee",
              borderTopWidth: 1,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {auth.currentUser?.phoneNumber}
            </Text>
            <Text style={{ fontSize: 12, color: "grey" }}>Номер телефону</Text>
          </View>

          <View
            style={{
              paddingVertical: 16,
              borderColor: "#eee",
              borderTopWidth: 1,
            }}
          >
            <Text style={{ fontSize: 16 }}>Люблю сміятися і спати</Text>
            <Text style={{ fontSize: 12, color: "grey" }}>Про себе</Text>
          </View>

          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              marginTop: 8,
            }}
            onPress={logout}
          >
            <Text
              style={{
                color: "red",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              Вийти
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AlertBox />
    </View>
  );
}
