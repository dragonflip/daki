import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { StatusBar } from "expo-status-bar";
import { Octicons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import "moment/locale/uk";
import Moment from "react-moment";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db, auth } from "../../firebase";

export default function SettingsScreen({ navigation }) {
  const [profile, setProfile] = useState([]);

  // Get data from storage
  useEffect(() => {
    // Get user profile
    let onlineChecker;

    const unsubscribeSnaphot = db
      .collection("users")
      .doc(auth.currentUser?.uid)
      .onSnapshot((snapshot) => {
        setProfile(snapshot.data());
        clearInterval(onlineChecker);

        // Check online status for changes
        onlineChecker = setInterval(() => {
          if (
            snapshot.data().online?.seconds <
            firebase.firestore.Timestamp.now().seconds
          ) {
            setProfile(snapshot.data());
            clearInterval(onlineChecker);
          }
        }, 10000);
      });

    return () => {
      unsubscribeSnaphot();
      clearInterval(onlineChecker);
    };
  }, []);

  // Logout
  async function logout() {
    // Change online status
    db.collection("users")
      .doc(auth.currentUser?.uid)
      .update({
        online: firebase.firestore.Timestamp.fromMillis(
          (firebase.firestore.Timestamp.now().seconds + 60) * 1000
        ),
      });

    await AsyncStorage.removeItem("phone");
    auth.signOut();

    navigation.replace("AuthPhone");
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <ScrollView>
        {profile.profilePhoto !== "" ? (
          <Image
            source={{
              uri: profile.profilePhoto,
            }}
            style={{
              width: Dimensions.get("window").width,
              height: Dimensions.get("window").width,
            }}
          />
        ) : (
          <View
            style={{
              width: Dimensions.get("window").width,
              height: Dimensions.get("window").width,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#eee",
            }}
          >
            <Ionicons
              name="camera"
              size={Dimensions.get("window").width * 0.4}
              color="#aaa"
            />
          </View>
        )}

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

              {profile.online?.seconds >
              firebase.firestore.Timestamp.now().seconds + 10 ? (
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

            <View
              style={{
                alignItems: "center",
                paddingBottom: 16,
              }}
            >
              <Text style={{ color: "red", fontSize: 24 }}>2.4★</Text>
              <Text style={{ color: "grey" }}>рейтинг</Text>
            </View>
          </View>

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
              // borderBottomWidth: 1,
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {profile.bio != "" ? profile.bio : "Розкажіть про себе"}
            </Text>
            <Text style={{ fontSize: 12, color: "grey" }}>Про себе</Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("MyProfileEdit", {
                userName: profile.name,
                userBio: profile.bio,
                userPhoto: profile.profilePhoto,
              })
            }
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="blue" />
            <Text style={{ color: "blue", fontSize: 16, marginLeft: 4 }}>
              Редагувати профіль та фото
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              marginTop: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={logout}
          >
            <MaterialCommunityIcons name="logout" size={16} color="red" />
            <Text style={{ color: "red", fontSize: 16, marginLeft: 4 }}>
              Вийти
            </Text>
          </TouchableOpacity>

          <Text
            style={{ textAlign: "center", color: "grey", marginVertical: 32 }}
          >
            Версія: {Constants.manifest.version}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
