import React, { useState } from "react";
import { Text, View, Image, TextInput, Pressable } from "react-native";

import { StatusBar } from "expo-status-bar";

// Styles
import styles from "./styles";

// Login screen
export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [buttonTouched, setButtonTouched] = useState(false);

  const emailHandler = () => {
    if (email == "a") {
      // alert("OK");
      // navigation.replace("Home");
      navigation.navigate("Home");
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

      <Image
        source={require("../../assets/logo.png")}
        style={{ width: 150, height: 150 }}
      />
      <Text style={styles.title}>Daki</Text>
      <Text style={[styles.helper, { marginBottom: 8 }]}>
        Для продовження введіть Ваші дані
      </Text>

      <TextInput
        style={styles.input}
        placeholder="E-MAIL"
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Pressable
        style={[styles.button, buttonTouched ? styles.buttonTouched : null]}
        onPress={emailHandler}
        onPressIn={() => setButtonTouched(true)}
        onPressOut={() => setButtonTouched(false)}
      >
        <Text style={styles.buttonText}>Продовжити</Text>
      </Pressable>
    </View>
  );
}
