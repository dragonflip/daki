import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, ScrollView, Image } from "react-native";

import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import "moment/locale/uk";
import Moment from "react-moment";
import StarRating from "react-native-star-rating";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db } from "../../firebase";
// Components
import LoadingScreen from "../../components/LoadingScreen";

export default function ProfileScreen({ route, navigation }) {
  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starRate, setStarRate] = useState(2.5);

  // Init
  useEffect(() => {
    // Get user info
    const userSnapshotUnsubscribe = db
      .collection("users")
      .doc(route.params.userId)
      .onSnapshot((snapshot) => {
        setProfile(snapshot.data());
        setLoading(false);
      });

    return userSnapshotUnsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {!loading ? (
        <ScrollView>
          {profile.profilePhoto !== "" ? (
            <Image
              source={{
                uri: profile.profilePhoto,
              }}
              style={{
                width: 192,
                height: 192,
                borderRadius: 192,
                alignSelf: "center",
                marginTop: 64,
              }}
            />
          ) : (
            <View
              style={{
                width: 192,
                height: 192,
                borderRadius: 192,
                alignSelf: "center",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 64,
                backgroundColor: "#eee",
              }}
            >
              <Text style={{ fontSize: 48 }}>{profile.name[0]}</Text>
            </View>
          )}

          <View style={{ paddingHorizontal: 16 }}>
            <View
              style={{
                paddingTop: 16,
                alignItems: "center",
              }}
            >
              <View style={{ paddingBottom: 16, alignItems: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{profile.name}</Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "red",
                      marginLeft: 8,
                    }}
                  >
                    2.4★
                  </Text>
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
            </View>

            {/* <View style={{ flex: 1, paddingBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <StarRating
                disabled={false}
                maxStars={5}
                rating={starRate}
                selectedStar={(rating) => setStarRate(rating)}
              />
            </View>
          </View> */}

            {/* <View
            style={{
              paddingVertical: 16,
              borderColor: "#eee",
              borderTopWidth: 1,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                textTransform: "uppercase",
                color: "red",
              }}
            >
              2.4★
            </Text>
            <Text style={{ fontSize: 12, color: "grey" }}>Рейтинг</Text>
          </View> */}

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
              <Text style={{ fontSize: 12, color: "grey" }}>
                Номер телефону
              </Text>
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
              <MaterialCommunityIcons
                name="block-helper"
                size={16}
                color="red"
              />
              <Text style={{ color: "red", fontSize: 16, marginLeft: 4 }}>
                Заблокувати
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <LoadingScreen />
      )}
    </View>
  );
}
