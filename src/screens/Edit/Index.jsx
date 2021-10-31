import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ImageBackground
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons } from "@expo/vector-icons"
import * as ImagePicker from 'expo-image-picker';
import Constants from "expo-constants";
import uuid from 'uuid';
import "moment/locale/uk";
import Moment from "react-moment";

// Styles
import styles from "./styles";
// Firebase
import { firebase, db, auth } from "../../firebase";

export default function EditScreen({ route, navigation }) {
  const [image, setImage] = useState(null);
  const [photo, setPhoto] = useState(route.params.profile_photo);
  const [newName, setNewName] = useState(route.params.userName);
  const [newBio, setNewBio] = useState(route.params.userBio);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
        headerTitle: "Редагувати",
        headerRight: () => (
          <TouchableOpacity onPress = {() => updateInfo(image)}>
            <Ionicons name="checkmark-sharp" size={26} color="#000" />
          </TouchableOpacity>
        ),
    });
  });


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
      aspect: [1, 1],
    });

    //console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
      setPhoto(result.uri);
    }
  };
  
  function updateInfo(uri){
    if(uri != null) uploadImageAsync(uri); else{
      db.collection("users").doc(auth.currentUser?.uid).update({
        name : newName,
        bio : newBio,
      });
      navigation.goBack();
    }
  }

  async function uploadImageAsync(uri) {
    const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            resolve(xhr.response);
        };
        xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
    });
  
    const ref = firebase
        .storage()
        .ref()
        .child(uuid.v4());
    const snapshot = await ref.put(blob);
  
    // We're done with the blob, close and release it
    blob.close();
  
    let url = await snapshot.ref.getDownloadURL();

    db.collection("users").doc(auth.currentUser?.uid).update({
      name : newName,
      bio : newBio,
      profilePhoto: url
    });

    navigation.goBack();
    return url;
    
  }
  

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View flexDirection="row" style = {{padding : 15}}>

        <TouchableOpacity onPress = {pickImage}>

          <ImageBackground source={image != null ? {uri : image} : {uri : route.params.userPhoto} } style={styles.profile_photo} imageStyle={{ borderRadius: 40}}>
            <Feather
            name = "camera"
            size = {32}
            style = {{backgroundColor: "rgba(211, 211, 211, 0.5)", padding: 19, borderRadius : 40}}
            />
          </ImageBackground>

        </TouchableOpacity>

        <View style={{marginLeft: 10}}>
          <TextInput 
          placeholder = "Ім'я" 
          style = {styles.input} onChangeText = {(name) => setNewName(name)} defaultValue = {route.params.userName} />

          <TextInput 
          placeholder = "Про себе" 
          style = {[styles.input, {marginTop: 5}]} on onChangeText = {(bio) => setNewBio(bio)} defaultValue = {route.params.userBio} />
        </View>
      </View>
    </View>
  );
}