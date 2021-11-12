import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Button,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import "moment/locale/uk";
import Moment from "react-moment";
import Modal from "react-native-modal";

// Styles
import colors from "../../styles/colors";
// Firebase
import { firebase, db, auth } from "../../firebase";
// Components
import LoadingScreen from "../../components/LoadingScreen";

export default function SettingsScreen({ navigation }) {
  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  // Get data from storage
  useEffect(() => {
    // Get user profile
    const unsubscribeSnaphot = db
      .collection("users")
      .doc(auth.currentUser?.uid)
      .onSnapshot((snapshot) => {
        setProfile(snapshot.data());
        setLoading(false);
      });

    return () => {
      unsubscribeSnaphot();
    };
  }, []);

  // Logout
  const logout = async () => {
    // Change online status
    db.collection("users").doc(auth.currentUser?.uid).update({
      online: firebase.firestore.Timestamp.now(),
    });

    auth.signOut();
    navigation.replace("AuthPhone");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray6 }}>
      <StatusBar style="auto" />

      <Modal
        isVisible={modal}
        useNativeDriverForBackdrop={true}
        onBackdropPress={() => setModal(false)}
      >
        <View
          style={{
            width: "100%",
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 16,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "300" }}>
            Що таке рейтинг?
          </Text>
          <Text style={{ marginVertical: 16 }}>
            Ваш рейтинг - це середнє значення всіх оцінок, які Ви отримали від
            інших людей.
          </Text>
          <Button onPress={() => setModal(false)} title="Закрити" />
        </View>
      </Modal>

      {!loading ? (
        <ScrollView>
          <View
            style={{
              backgroundColor: "#fff",
              paddingBottom: 16,
            }}
          >
            <ImageBackground
              source={profile.photo != "" ? { uri: profile.photo } : null}
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
                <Text style={{ color: colors.green }}>онлайн</Text>
              ) : (
                <Text style={{ color: colors.gray }}>
                  В мережі{" "}
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
              onPress={() =>
                navigation.navigate("MyProfileEdit", {
                  userName: profile.name,
                  userBio: profile.bio,
                  userPhoto: profile.photo,
                })
              }
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
            <TouchableOpacity
              style={{
                paddingVertical: 16,
                backgroundColor: "#fff",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottomWidth: 1,
                borderBottomColor: colors.gray6,
              }}
              onPress={() => setModal(true)}
            >
              <View>
                <Text style={{ fontSize: 16 }}>Соціальний рейтинг</Text>
                <Text style={{ fontSize: 12, color: colors.gray }}>
                  Натисніть для детальнішої інформації
                </Text>
              </View>

              <View
                style={{
                  borderWidth: 1,
                  borderColor: "red",
                  borderRadius: 16,
                  paddingHorizontal: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "300",
                    color: "red",
                  }}
                >
                  2.4★
                </Text>
              </View>
            </TouchableOpacity>

            <View
              style={{
                paddingVertical: 16,
                borderBottomColor: colors.gray6,
                borderBottomWidth: 1,
              }}
            >
              <Text style={{ fontSize: 16 }}>
                {auth.currentUser?.phoneNumber}
              </Text>
              <Text style={{ fontSize: 12, color: colors.gray }}>
                Номер телефону
              </Text>
            </View>

            <View style={{ paddingVertical: 16 }}>
              <Text style={{ fontSize: 16 }}>
                {profile.bio != "" ? profile.bio : "Розкажіть про себе"}
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
              onPress={logout}
            >
              <MaterialCommunityIcons
                name="logout"
                size={18}
                color={colors.red}
              />
              <Text style={{ color: colors.red, fontSize: 16, marginLeft: 12 }}>
                Вийти з аккаунта
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text
              style={{
                textAlign: "center",
                color: colors.gray,
                marginVertical: 32,
              }}
            >
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
