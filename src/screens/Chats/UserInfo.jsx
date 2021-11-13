import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import "moment/locale/uk";
import Moment from "react-moment";

// Styles
import colors from "../../styles/colors";
// Firebase
import { firebase, db, auth } from "../../firebase";
// Components
import LoadingScreen from "../../components/LoadingScreen";

export default function ProfileScreen({ route, navigation }) {
  const [profile, setProfile] = useState([]);
  const [rating, setRating] = useState([]);
  const [loading, setLoading] = useState(true);

  // Init
  useEffect(() => {
    // Get user info
    const userSnapshotUnsubscribe = db
      .collection("users")
      .doc(route.params.userId)
      .onSnapshot((snapshot) => {
        setProfile(snapshot.data());
      });

    // Get user rating
    const ratingSnapshotUnsubscribe = db
      .collection("users")
      .doc(route.params.userId)
      .collection("rating")
      .onSnapshot((snapshot) => {
        // Get likes and dislikes
        const likes = snapshot.docs.filter(
          (doc) => doc.data().type === "like"
        ).length;
        const dislikes = snapshot.docs.filter(
          (doc) => doc.data().type === "dislike"
        ).length;

        // If rated get mark type
        const ratedByMe = snapshot.docs.filter(
          (doc) => doc.id === auth.currentUser?.uid
        );
        const rateType = ratedByMe?.[0]?.data().type ?? null;

        setRating({ likes: likes, dislikes: dislikes, rateType: rateType });
        setLoading(false);
      });

    return () => {
      userSnapshotUnsubscribe();
      ratingSnapshotUnsubscribe();
    };
  }, []);

  const rate = async (rateType) => {
    // TODO test rateType for errors
    if (rating.rateType === null || rating.rateType !== rateType) {
      // If no like and no dislike
      // OR
      // If like or dislike and clicked on the opposite rate type
      await db
        .collection("users")
        .doc(route.params.userId)
        .collection("rating")
        .doc(auth.currentUser?.uid)
        .set({
          type: rateType,
        });
    } else {
      // If like or dislike and clicked on the same rate type
      await db
        .collection("users")
        .doc(route.params.userId)
        .collection("rating")
        .doc(auth.currentUser?.uid)
        .delete();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray6 }}>
      <StatusBar style="auto" />

      {!loading ? (
        <ScrollView>
          <View
            style={{
              backgroundColor: "#fff",
              paddingBottom: 16,
            }}
          >
            <ImageBackground
              source={
                profile.photo !== ""
                  ? { uri: profile.photo, cache: "force-cache" }
                  : null
              }
              style={{
                width: 192,
                height: 192,
                borderRadius: 192,
                backgroundColor: colors.gray6,
                alignSelf: "center",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 64,
              }}
              imageStyle={{ borderRadius: 192 }}
            >
              {profile.photo === "" ? (
                <Text style={{ fontSize: 48 }}>{profile.name[0]}</Text>
              ) : null}
            </ImageBackground>

            <View style={{ alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                {profile.name}
              </Text>

              {profile.online?.seconds >
              firebase.firestore.Timestamp.now().seconds + 10 ? (
                <Text style={{ color: "green" }}>у мережі</Text>
              ) : (
                <Text style={{ color: colors.gray }}>
                  у мережі{" "}
                  <Moment element={Text} locale="uk" fromNow unix>
                    {profile.online?.seconds}
                  </Moment>
                </Text>
              )}
            </View>
          </View>

          <View
            style={{
              marginTop: 16,
              paddingHorizontal: 16,
              backgroundColor: "#fff",
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()} // TODO navigation to chat history
              style={{
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={18}
                color={colors.blue}
              />
              <Text
                style={{ color: colors.blue, fontSize: 16, marginLeft: 12 }}
              >
                Написати повідомлення
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: 16,
              paddingHorizontal: 16,
              backgroundColor: "#fff",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onPress={() => setModal(true)}
            >
              <View style={{ paddingVertical: 16 }}>
                <Text style={{ fontSize: 16 }}>Соціальний рейтинг</Text>
                <Text style={{ fontSize: 12, color: colors.gray }}>
                  Натисніть, щоб оцінити
                </Text>
              </View>

              <View>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={{ alignItems: "center", width: 64 }}
                    onPress={() => rate("like")}
                  >
                    <MaterialCommunityIcons
                      name={
                        rating.rateType === "like"
                          ? "thumb-up"
                          : "thumb-up-outline"
                      }
                      size={24}
                      color={colors.green}
                    />
                    <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                      {rating.likes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ alignItems: "center", width: 64 }}
                    onPress={() => rate("dislike")}
                  >
                    <MaterialCommunityIcons
                      name={
                        rating.rateType === "dislike"
                          ? "thumb-down"
                          : "thumb-down-outline"
                      }
                      size={24}
                      color={colors.red}
                    />
                    <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                      {rating.dislikes}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View
              style={{
                paddingVertical: 16,
                borderTopWidth: 1,
                borderTopColor: colors.gray6,
              }}
            >
              <Text style={{ fontSize: 16 }}>{profile.phone}</Text>
              <Text style={{ fontSize: 12, color: colors.gray }}>
                Номер телефону
              </Text>
            </View>

            {profile.bio !== "" ? (
              <View
                style={{
                  paddingVertical: 16,
                  borderTopWidth: 1,
                  borderTopColor: colors.gray6,
                }}
              >
                <Text style={{ fontSize: 16 }}>
                  {profile.bio !== "" ? profile.bio : "Розкажіть про себе"}
                </Text>
                <Text style={{ fontSize: 12, color: colors.gray }}>
                  Про себе
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={{
              marginTop: 16,
              paddingHorizontal: 16,
              backgroundColor: "#fff",
            }}
          >
            <TouchableOpacity
              style={{
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="block-helper"
                size={18}
                color={colors.red}
              />
              <Text style={{ color: colors.red, fontSize: 16, marginLeft: 12 }}>
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
