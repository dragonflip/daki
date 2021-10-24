import React from "react";
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";

export default function ButtonWithLoading(props) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={props.onPress}
      activeOpacity={0.8}
      disabled={props.loading}
    >
      {!props.loading ? (
        <Text style={styles.buttonText}>{props.title}</Text>
      ) : (
        <ActivityIndicator
          color="#fff"
          size={Platform.OS === "android" ? "large" : "small"}
          style={
            Platform.OS === "android" ? { marginTop: 8 } : { marginTop: 16 }
          }
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "stretch",
    backgroundColor: "#000",
    borderRadius: 8,

    marginHorizontal: 16,
    marginVertical: 4,
    height: 52,
  },
  buttonText: {
    color: "#fff",
    textTransform: "uppercase",
    textAlign: "center",
    lineHeight: 52,
  },
});
