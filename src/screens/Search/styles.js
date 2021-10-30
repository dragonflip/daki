import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  input: {
    height: 40,
    width: 300,
    fontSize: 18
  },
  chat: {
    alignSelf: "stretch",
    // backgroundColor: "#eee",
    height: 72,
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  chat_photo: {
    width: 56,
    height: 56,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  chat_info: {
    flexDirection: "column",
    flex: 1,
    paddingLeft: 8,
  },

  chat_name_date_status: {
    flexDirection: "row",
    height: 20,
  },

  profile_name: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
});
