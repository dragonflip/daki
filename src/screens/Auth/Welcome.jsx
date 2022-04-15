import React, { useEffect, useState, useRef } from "react";
import { Text, View, Image, TextInput, Platform } from "react-native";

import { StatusBar } from "expo-status-bar";

// Firebase
import { auth, db } from "../../firebase";
// Styles
import styles from "./styles";
// Components
import ButtonWithLoading from "../../components/ButtonWithLoading";
import KeyboardAvoider from "../../components/KeyboardAvoider";

export default function AuthWelcomeScreen({ navigation }) {
  const [name, setName] = useState("");

  const input = useRef(null);
  const [loading, setLoading] = useState(false);

  // Init
  useEffect(() => {
    if (Platform.OS !== "ios") setTimeout(() => input.current.focus(), 1);
  }, []);

  // User registration
  const userSignup = async () => {
    if (name.trim().length > 0) {
      setLoading(true);

      // Add new user
      db.collection("users").doc(auth.currentUser?.uid).set({
        userId: auth.currentUser?.uid,
        phone: auth.currentUser?.phoneNumber,
        name: name,
        photo: "",
        bio: "",
        verified: false,
      });

      navigation.popToTop();
      navigation.replace("Main");

      console.log("Registered");
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
          selectionColor="#000"
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
