import React, { useState, useEffect } from "react";
import {
  Button,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Styles
import styles from "./styles";
// Firebase
import { auth } from "../../firebase";

export default function ChatHistoryScreen({ navigation }) {
  // const [phone, setPhone] = useState("");

  // Get data from storage
  // useEffect(() => {
  //   async function getPhone() {
  //     const phone = await AsyncStorage.getItem("phone");
  //     setPhone(phone);
  //   }

  //   getPhone();
  // }, []);

  // useFocusEffect(() => {
  //   console.log("Settings");
  // });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () =>
      Platform.OS === "ios" ? (
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Святік
          </Text>
          <Text style={{ fontSize: 12, color: "green" }}>онлайн</Text>
        </View>
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate('Налаштування')}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: -8,
            }}
          >
            <Image
              style={{
                backgroundColor: "#aaa",
                width: 42,
                height: 42,
                borderRadius: 42,
                marginRight: 12,
              }}
              source={{
                uri: "https://habrastorage.org/r/w60/files/80c/815/1a4/80c8151a49e64eeda729744bca32116d.jpg",
              }}
            />
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                Святік
              </Text>
              <Text style={{ fontSize: 12, color: "green" }}>онлайн</Text>
            </View>
          </View>
        </TouchableOpacity>
      ),
        headerRight: () =>
                Platform.OS === "ios" ? (
                  <Image
                    style={{
                      backgroundColor: "#aaa",
                      width: 32,
                      height: 32,
                      borderRadius: 32,
                      marginRight: -8,
                    }}
                    source={{
                      uri: "https://habrastorage.org/r/w60/files/80c/815/1a4/80c8151a49e64eeda729744bca32116d.jpg",
                    }}
                  />
                ) : (
                  <TouchableOpacity>
                    <MaterialCommunityIcons
                      name="dots-vertical"
                      size={24}
                      color="black"
                    />
                  </TouchableOpacity>
                ),
    });
  },);


  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "column-reverse",
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              backgroundColor: "#eee",
              alignSelf: "flex-start",

              paddingLeft: 16,
              paddingRight: 8,
              paddingVertical: 8,
              marginHorizontal: 16,
              marginVertical: 2,

              borderTopRightRadius: 16,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,

              alignItems: "flex-end",
              flexDirection: "row",
            }}
          >
            <Text style={{ color: "black" }}>Дякую знаю</Text>
            <Text
              style={{
                color: "#aaa",
                fontSize: 10,
                marginLeft: 12,
                marginRight: 1,
              }}
            >
              14:27
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "black",
              alignSelf: "flex-end",

              paddingLeft: 16,
              paddingRight: 8,
              paddingVertical: 8,
              marginHorizontal: 16,
              marginVertical: 2,

              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,

              alignItems: "flex-end",
              flexDirection: "row",
            }}
          >
            <Text style={{ color: "white" }}>Ого мужик, ну ти крутий</Text>
            <Text
              style={{
                color: "#aaa",
                fontSize: 10,
                marginLeft: 12,
                marginRight: 1,
              }}
            >
              14:25
            </Text>
            <Ionicons
              name="checkmark-done"
              size={16}
              color="#aaa"
              style={{ alignSelf: "flex-end", height: 15 }}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TextInput
            style={{
              borderColor: "#eee",
              borderWidth: 2,
              borderRadius: 44,
              height: 44,
              paddingHorizontal: 16,
              marginHorizontal: 16,
              flex: 1,
            }}
            placeholder="Повідомлення..."
          />
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Ionicons name="send" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
