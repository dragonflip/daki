import React, { useState, useRef, useEffect } from "react";
import { Text, View, Image, TextInput, Alert } from "react-native";

import { StatusBar } from "expo-status-bar";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

// Firebase
import { firebase, auth, db } from "../../firebase";
// Styles
import styles from "./styles";
// Components
import ButtonWithLoading from "../../components/ButtonWithLoading";
import KeyboardAvoider from "../../components/KeyboardAvoider";

export default function AuthPhoneScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const recaptchaVerifier = useRef(null);

  const input = useRef(null);
  const [loading, setLoading] = useState(false);

  // Init
  useEffect(() => {
    setLoading(true);

    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      const userDoc = await db
        .collection("users")
        .doc(auth.currentUser?.uid)
        .get();

      // If user exists go to home screen
      if (user && userDoc.exists) {
        if (navigation.isFocused()) {
          navigation.replace("Home");
        }
      } else {
        setLoading(false);
        setTimeout(() => input.current.focus(), 1000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Send SMS verification code
  const sendVerificationCode = async () => {
    if (phone.trim().length === 13) {
      try {
        setLoading(true);

        const phoneProvider = new firebase.auth.PhoneAuthProvider();
        const verificationId = await phoneProvider.verifyPhoneNumber(
          phone,
          recaptchaVerifier.current
        );

        setLoading(false);
        navigation.navigate("Code", {
          phone: phone,
          verificationId: verificationId,
        });

        console.log(verificationId);
      } catch (err) {
        setLoading(false);
        Alert.alert("Помилка", "Некоректний номер телефону");
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebase.app().options}
        attemptInvisibleVerification={true}
        androidHardwareAccelerationDisabled={true}
      />

      <KeyboardAvoider style={styles.container}>
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
          selectionColor="#000"
        />

        <ButtonWithLoading
          title="Продовжити"
          onPress={sendVerificationCode}
          loading={loading}
        />
      </KeyboardAvoider>
    </View>
  );
}
