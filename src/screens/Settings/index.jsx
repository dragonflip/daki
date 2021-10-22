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

import { StatusBar } from "expo-status-bar";
import { Feather, Octicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import { AlertBox, fire } from "react-native-alertbox";
import "moment/locale/uk";
import Moment from "react-moment";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db, auth } from "../../firebase";

export default function SettingsScreen({ navigation }) {
  const [profile, setProfile] = useState([]);

  const [photoRounded, setPhotoRounded] = useState(false);
  const [photoMultiplicator, setPhotoMultiplicator] = useState(1);

  // Get data from storage
  useEffect(() => {
    // Get user profile
    const unsubscribeSnaphot = db
      .collection("users")
      .doc(auth.currentUser?.uid)
      .onSnapshot((snapshot) => {
        setProfile(snapshot.data());
      });

    return unsubscribeSnaphot;
  }, []);

  // Change name (fake)
  function changeName() {
    fire({
      title: "Зміна імені",
      message: "Введіть нове імя: ",
      // buttons
      actions: [
        {
          text: "Сквасувати",
          style: "cancel",
        },
        {
          text: "Підтвердити",
          onPress: (data) => setProfile({ ...profile, name: data.name }), // It is an object that holds fields data
        },
      ],
      // fields
      fields: [
        {
          name: "name",
          placeholder: "Введіть імя",
        },
      ],
    });
  }

  // Logout
  async function logout() {
    // Change online status
    db.collection("users")
      .doc(auth.currentUser?.uid)
      .update({ online: firebase.firestore.Timestamp.now() });

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
            <View style={{ flex: 1, paddingBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 24 }}>{profile.name}</Text>

                {profile.verified ? (
                  <Octicons
                    name="verified"
                    size={20}
                    color="blue"
                    style={{ marginLeft: 8 }}
                  />
                ) : null}
              </View>

              {profile.online === true ? (
                <Text style={{ color: "green" }}>онлайн</Text>
              ) : (
                <View>
                  <Text style={{ color: "grey" }}>
                    В мережі{" "}
                    <Moment element={Text} locale="uk" fromNow unix>
                      {profile.online?.seconds}
                    </Moment>
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: "grey",
                borderRadius: 24,
                padding: 8,
              }}
              onPress={changeName}
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
            <Text style={{ fontSize: 16 }}>
              {profile.bio != "" ? profile.bio : "Розкажіть про себе"}
            </Text>
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

          <Text style={{ textAlign: "center", color: "grey", marginTop: 32 }}>
            Версія: {Constants.manifest.version}
          </Text>
        </View>
      </ScrollView>

      <AlertBox />
    </View>
  );
}
