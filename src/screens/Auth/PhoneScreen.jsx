import React, { useState, useRef, useEffect } from "react";
import { Text, View, Image, TextInput } from "react-native";

import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Firebase
import { firebase, auth } from "../../firebase";
// Styles
import styles from "./styles";
// Components
import ButtonWithLoading from "../../components/ButtonWithLoading";

export default function AuthPhoneScreen({ navigation }) {
  const [phone, setPhone] = useState(null);
  const recaptchaVerifier = useRef(null);

  const input = useRef(null);
  const [loading, setLoading] = useState(false);

  // Init
  useEffect(() => {
    setLoading(true);

    auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.navigate("Home");
      } else {
        setTimeout(() => input.current.focus(), 1000);
      }

      setLoading(false);
    });
  }, []);

  // Send SMS verification code
  const sendVerificationCode = async () => {
    try {
      setLoading(true);

      const phoneProvider = new firebase.auth.PhoneAuthProvider();
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phone,
        recaptchaVerifier.current
      );

      await AsyncStorage.setItem("phone", phone);

      setLoading(false);
      navigation.navigate("Code", {
        phone: phone,
        verificationId: verificationId,
      });

      console.log(verificationId);
    } catch (err) {
      setLoading(false);

      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebase.app().options}
        attemptInvisibleVerification={true}
      />

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
        <Text style={styles.title}>Daki</Text>
        <Text style={[styles.helper, { marginBottom: 8 }]}>
          Для продовження введіть номер телефону
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Номер телефону"
          onChangeText={setPhone}
          keyboardType="phone-pad"
          defaultValue="+380"
          ref={input}
          maxLength={13}
        />

        <ButtonWithLoading
          title="Продовжити"
          onPress={sendVerificationCode}
          loading={loading}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}
