import React, { useEffect, useState, useRef } from "react";
import { Text, View, Image, TextInput } from "react-native";

import { StatusBar } from "expo-status-bar";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Firebase
import { firebase, auth, db } from "../../firebase";
// Styles
import styles from "./styles";
// Components
import ButtonWithLoading from "../../components/ButtonWithLoading";

export default function AuthWelcomeScreen({ navigation, route }) {
  const [name, setName] = useState("");

  const input = useRef(null);
  const [loading, setLoading] = useState(false);

  // Init
  useEffect(() => {
    setTimeout(() => input.current.focus(), 1);
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
      });

      setLoading(false);

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

      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        style={{ width: "100%" }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
      >
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
        />

        <ButtonWithLoading
          title="Почати спілкування"
          onPress={userSignup}
          loading={loading}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}
