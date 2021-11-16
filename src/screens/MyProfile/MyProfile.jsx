import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import moment from "moment";
import Moment from "react-moment";

// Styles
import colors from "../../styles/colors";
// Firebase
import { firebase, db, auth } from "../../firebase";
// Components
import LoadingScreen from "../../components/LoadingScreen";

export default function MyProfileScreen({ navigation }) {
  const [profile, setProfile] = useState([]);
  const [rating, setRating] = useState({ likes: 0, dislikes: 0 });
  const [loading, setLoading] = useState(true);

  // Init
  useEffect(() => {
    // Get my profile
    const userSnapshotUnsubscribe = db
      .collection("users")
      .doc(auth.currentUser?.uid)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          setProfile(snapshot.data());
        }
      });

    // Get my rating
    const ratingSnapshotUnsubscribe = db
      .collection("users")
      .doc(auth.currentUser?.uid)
      .collection("rating")
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          // Get likes and dislikes
          const likes = snapshot.docs.filter(
            (doc) => doc.data().type === "like"
          ).length;
          const dislikes = snapshot.docs.filter(
            (doc) => doc.data().type === "dislike"
          ).length;

          setRating({ likes: likes, dislikes: dislikes });
        }

        setLoading(false);
      });

    return () => {
      userSnapshotUnsubscribe();
      ratingSnapshotUnsubscribe();
    };
  }, []);

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
                backgroundColor: colors.gray,
                alignSelf: "center",
                alignItems: "center", // TODO center text iOS
                justifyContent: "center",
                marginTop: 64,
              }}
              imageStyle={{ borderRadius: 192 }}
            >
              {profile.photo === "" ? (
                <Text
                  style={{
                    fontSize: 64,
                    color: "#fff",
                    includeFontPadding: false,
                    textAlign: "center",
                  }}
                >
                  {profile.name[0]}
                </Text>
              ) : null}
            </ImageBackground>

            <View style={{ marginTop: 8 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {profile.name}
              </Text>

              {profile.online?.seconds >
              firebase.firestore.Timestamp.now().seconds + 10 ? (
                <Text style={{ color: "green", textAlign: "center" }}>
                  у мережі
                </Text>
              ) : (
                <Text style={{ color: colors.gray, textAlign: "center" }}>
                  у мережі{" — "}
                  <Moment
                    element={Text}
                    format={
                      moment
                        .unix(moment().unix())
                        .isSame(moment.unix(profile.online?.seconds), "date")
                        ? "HH:mm"
                        : "DD.MM.YYYY в HH:mm"
                    }
                    unix
                  >
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
              onPress={() => navigation.navigate("MyProfileEdit")}
              style={{
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={20}
                color={colors.blue}
              />
              <Text
                style={{ color: colors.blue, fontSize: 16, marginLeft: 12 }}
              >
                Редагувати профіль та фото
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
            >
              <View style={{ paddingVertical: 16 }}>
                <Text style={{ fontSize: 16 }}>Соціальний рейтинг</Text>
                <Text style={{ fontSize: 12, color: colors.gray }}>
                  Загальна кількість оцінок
                </Text>
              </View>

              <View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ alignItems: "center", width: 64 }}>
                    <MaterialCommunityIcons
                      name="thumb-up-outline"
                      size={24}
                      color={colors.green}
                    />
                    <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                      {rating.likes}
                    </Text>
                  </View>

                  <View style={{ alignItems: "center", width: 64 }}>
                    <MaterialCommunityIcons
                      name="thumb-down-outline"
                      size={24}
                      color={colors.red}
                    />
                    <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                      {rating.dislikes}
                    </Text>
                  </View>
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
              <Text style={{ fontSize: 16 }}>
                {auth.currentUser?.phoneNumber}
              </Text>
              <Text style={{ fontSize: 12, color: colors.gray }}>
                Номер телефону
              </Text>
            </View>

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
              <Text style={{ fontSize: 12, color: colors.gray }}>Про себе</Text>
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
              style={{
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={async () => {
                await auth.signOut();
                navigation.replace("AuthPhone");
              }}
            >
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color={colors.red}
              />
              <Text style={{ color: colors.red, fontSize: 16, marginLeft: 12 }}>
                Вийти з аккаунта
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: "center", marginVertical: 32 }}>
            <MaterialCommunityIcons
              name={Platform.OS === "ios" ? "apple-ios" : "android"}
              size={24}
              color={colors.gray}
            />
            <Text style={{ color: colors.gray }}>
              Версія: {Constants.manifest.version}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <LoadingScreen />
      )}
    </View>
  );
}
