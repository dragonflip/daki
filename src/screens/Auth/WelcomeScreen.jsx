import React, { useEffect, useState, useRef } from "react";
import { Text, View, Image, TextInput, Platform } from "react-native";

import { StatusBar } from "expo-status-bar";

// Firebase
import { firebase, auth, db } from "../../firebase";
// Styles
import styles from "./styles";
// Components
import ButtonWithLoading from "../../components/ButtonWithLoading";
import KeyboardAvoider from "../../components/KeyboardAvoider";

export default function AuthWelcomeScreen({ navigation, route }) {
  const [name, setName] = useState("");

  const input = useRef(null);
  const [loading, setLoading] = useState(false);

  // Init
  useEffect(() => {
    if (Platform.OS !== "ios") setTimeout(() => input.current.focus(), 1);
  }, []);

  // User registration
  const userSignup = async () => {
    try {
      setLoading(true);

      // Add new user
      db.collection("users").doc(auth.currentUser?.uid).set({
        phone: auth.currentUser?.phoneNumber,
        name: name,
        profilePhoto: "",
        online: true,
        bio: "",
        verified: false,
      });

      navigation.popToTop();
      navigation.replace("Home");

      console.log("Registered");
    } catch (err) {
      setLoading(false);

      console.log(err);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { alignItems: "center", justifyContent: "center" },
      ]}
    >
      <StatusBar style="auto" />

      <KeyboardAvoider style={styles.container}>
        <Image
          source={require("../../../assets/logo.png")}
          style={{ width: 150, height: 150 }}
        />
        <Text style={styles.title}>Вітаємо в Daki</Text>
        <Text style={[styles.helper, { marginBottom: 8 }]}>Як Вас звати?</Text>

        <TextInput
          style={styles.input}
          placeholder="Ім'я"
          onChangeText={setName}
          ref={input}
          maxLength={20}
          autoFocus={Platform.OS === "ios"}
        />

        <ButtonWithLoading
          title="Почати спілкування"
          onPress={userSignup}
          loading={loading}
        />
      </KeyboardAvoider>
    </View>
  );
}
