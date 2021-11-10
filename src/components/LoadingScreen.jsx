import React from "react";
import { ActivityIndicator, Platform } from "react-native";

export default function LoadingScreen() {
  return (
    <ActivityIndicator
      color="#000"
      style={{ flex: 1 }}
      size={Platform.OS === "android" ? "large" : "small"}
    />
  );
}
