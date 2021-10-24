import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  ImageBackground
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Feather, Octicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import { AlertBox, fire } from "react-native-alertbox";
import "moment/locale/uk";
import Moment from "react-moment";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db, auth } from "../../firebase";

export default function SettingsScreen({ navigation }) {
  const [profile, setProfile] = useState([]);

  const [photoRounded, setPhotoRounded] = useState(false);
  const [photoMultiplicator, setPhotoMultiplicator] = useState(1);

  // Get data from storage
  useEffect(() => {
    // Get user profile
    const unsubscribeSnaphot = db
      .collection("users")
      .doc(auth.currentUser?.uid)
      .onSnapshot((snapshot) => {
        setProfile(snapshot.data());
      });

       navigation.setOptions({
        //headerTintColor: '#fff',
        headerTransparent: true,
        headerTitle: "",
        shadowColor: 'transparent',
        headerShadowVisible: false,
        headerRight: () =>
          <View flexDirection="row">
              <TouchableOpacity style = {{paddingRight : 15}}>
                <MaterialCommunityIcons
                  name="star-outline"
                  size={26}
                  color="black"
                />
            </TouchableOpacity>

            <TouchableOpacity style = {{paddingRight : 15}}>
                <Entypo
                  name="edit"
                  size={26}
                  color="black"
                />
            </TouchableOpacity>

              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={26}
                  color="black"
                />
            </TouchableOpacity>

          </View>
       });


    return unsubscribeSnaphot;
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <ScrollView >
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1566275529824-cca6d008f3da?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fGNvdmVyJTIwcGhvdG98ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80",
          }}
          
          style={{
                  flexDirection: "row",
                  width: Dimensions.get("window").width * photoMultiplicator,
                  height: Dimensions.get("window").width,
                  alignSelf: "center",

          }}
        >
        <View flexDirection = "column" style = {{justifyContent: 'flex-end'}} >
          <Text style={{
                  color: "white",
                  //textAlignVertical : "bottom",
                  fontSize: 28,
                  paddingLeft : 10,
                }}>
                {profile.name}
          </Text>
          {profile.online === true ? (
                <Text style={{ color: "green", fontSize: 20,paddingBottom: 5, paddingLeft : 10 }}>онлайн</Text>
              ) : (
                <View>
                  <Text style={{ color: "grey",fontSize: 20, paddingBottom: 5, paddingLeft : 10 }}>
                    В мережі{" "}
                    <Moment element={Text} locale="uk" fromNow unix>
                      {profile.online?.seconds}
                    </Moment>
                  </Text>
                </View>
              )}
        </View> 
        </ImageBackground>

        <View style={{ paddingHorizontal: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingTop: 16,
            }}
          >
            <View style={{ flex: 1, paddingBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 24 }}>'Соціальний рейтинг'</Text>
              </View>
            </View>
          </View>

          <View
            style={{
              paddingVertical: 16,
              borderColor: "#eee",
              borderTopWidth: 1,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {auth.currentUser?.phoneNumber}
            </Text>
            <Text style={{ fontSize: 12, color: "grey" }}>Номер телефону</Text>
          </View>

          <View
            style={{
              paddingVertical: 16,
              borderColor: "#eee",
              borderTopWidth: 1,
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {profile.bio != "" ? profile.bio : "Я крутий дуже крутий мужик"}
            </Text>
            <Text style={{ fontSize: 12, color: "grey" }}>Інформація</Text>
          </View>

          <TouchableOpacity
            style={{
              borderWidth: 0.5,
              borderColor: "#eee",
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              marginTop: 8,
            }}
            //onPress={}
          >
            <Text
              style={{
                color: "red",
                //textTransform: "uppercase",
                textAlign: "left",
                fontSize: 18
              }}
            >
              Заблокувати
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      <AlertBox />
    </View>
  );
}
