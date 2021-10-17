import React, { useEffect, useState, useRef } from "react";
import { Text, View, Image, TextInput } from "react-native";

import { StatusBar } from "expo-status-bar";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Firebase
import { firebase, db } from "../../firebase";
// Styles
import styles from "./styles";
// Components
import ButtonWithLoading from "../../components/ButtonWithLoading";

export default function AuthCodeScreen({ navigation, route }) {
  const [code, setCode] = useState("");
  const [userExists, setUserExists] = useState(false);

  const input = useRef(null);
  const [loading, setLoading] = useState(false);

  // Init
  useEffect(() => {
    (async () => {
      setLoading(true);

      // Check if user exists
      const users = await db
        .collection("users")
        .where("phone", "==", route.params.phone)
        .get();

      setUserExists(!users.empty);
      setLoading(false);
    })();

    setTimeout(() => input.current.focus(), 1);
  }, []);

  // Confirm SMS verification code
  const confirmVerificationCode = async () => {
    try {
      setLoading(true);

      const credential = firebase.auth.PhoneAuthProvider.credential(
        route.params.verificationId,
        code
      );
      await firebase.auth().signInWithCredential(credential);

      setLoading(false);

      // Check if user exists
      if (!userExists) {
        navigation.navigate("Welcome", { ...route.params });
      } else {
        navigation.popToTop();
        navigation.replace("Home");
      }

      console.log("Success");
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
        <Text style={styles.title}>{route.params.phone}</Text>
        <Text style={[styles.helper, { marginBottom: 8 }]}>
          Ми надіслали Вам код підтвердження
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Код підтвердження"
          onChangeText={setCode}
          keyboardType="number-pad"
          ref={input}
          maxLength={6}
        />

        <ButtonWithLoading
          title={userExists ? "Увійти" : "Продовжити"}
          onPress={confirmVerificationCode}
          loading={loading}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}
