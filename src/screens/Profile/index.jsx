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
import { Octicons, Ionicons, Entypo } from "@expo/vector-icons";
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

  // Get data from storage
  useEffect(() => {
    let onlineChecker;

    // Get member
    // TODO chat group info
    const memberSnapshotUnsubscribe = db
      .collection("users")
      .doc(route.params.userId)
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
      memberSnapshotUnsubscribe;
      clearInterval(onlineChecker);
    };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: "",
      shadowColor: "transparent",
      headerShadowVisible: false,
    });
  });

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

          {console.log(starRate)}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              paddingVertical: 16,
              borderColor: "#eee",
              borderTopWidth: 1,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "blue",
                //textTransform: "uppercase",
              }}
            >
              <Entypo name="message" size={14} color="blue" />
              Написати повідомлення
            </Text>
          </TouchableOpacity>

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
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              marginTop: 8,
            }}
            //onPress={logout}
          >
            <Text
              style={{
                color: "red",
                //textTransform: "uppercase",
                textAlign: "left",
              }}
            >
              Заблокувати
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
