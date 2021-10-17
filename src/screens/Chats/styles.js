import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  chat: {
    alignSelf: "stretch",
    backgroundColor: "#eee",
    height: 72,
    flexDirection: "row",
    padding: 8,
  },

  chat_photo: {
    backgroundColor: "#aaa",
    width: 56,
    height: 56,
    borderRadius: 56,
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

  chat_date_status: {
    flexDirection: "row",
    alignItems: "center",
  },

  chat_name: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  chat_date: {
    fontSize: 13,
    marginLeft: 4,
    color: "grey",
  },
  chat_message: {
    flexDirection: "column",
    height: 36,
    color: "grey",
  },

  chat_online: {
    position: "absolute",
    top: 49,
    left: 49,
    width: 14,
    height: 14,
    borderRadius: 14,
    borderColor: "white",
    borderWidth: 2,
    backgroundColor: "green",
  },
});
