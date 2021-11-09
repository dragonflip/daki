import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Octicons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import "moment/locale/uk";
import Moment from "react-moment";
import StarRating from "react-native-star-rating";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db } from "../../firebase";

export default function ProfileScreen({ route, navigation }) {
  const [profile, setProfile] = useState([]);
  const [starRate, setStarRate] = useState(2.5);

  // Navigation
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: "",
      shadowColor: "transparent",
      headerShadowVisible: false,
    });
  });

  // Init
  useEffect(() => {
    // Get chat info
    if (route.params.chatId === route.params.userId) {
      // Group
      const chatSnapshotUnsubscribe = db
        .collection("chats")
        .doc(route.params.chatId)
        .onSnapshot((snapshot) => {
          setProfile({
            name: snapshot.data().groupName,
            photo: snapshot.data().groupPhoto,
          });
        });

      return chatSnapshotUnsubscribe;
    } else {
      // Dialog
      const userSnapshotUnsubscribe = db
        .collection("users")
        .doc(route.params.userId)
        .onSnapshot((snapshot) => {
          setProfile(snapshot.data());
        });

      return userSnapshotUnsubscribe;
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <ScrollView>
        {profile.photo !== "" ? (
          <Image
            source={{
              uri: profile.photo,
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

          <View style={{ flex: 1, paddingBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <StarRating
                disabled={false}
                maxStars={5}
                rating={starRate}
                selectedStar={(rating) => setStarRate(rating)}
              />
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
              {profile.phone}
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
            onPress={() => navigation.goBack()}
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
            <MaterialCommunityIcons name="send" size={16} color="blue" />
            <Text style={{ color: "blue", fontSize: 16, marginLeft: 4 }}>
              Написати повідомлення
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
          >
            <MaterialCommunityIcons name="block-helper" size={16} color="red" />
            <Text style={{ color: "red", fontSize: 16, marginLeft: 4 }}>
              Заблокувати
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
