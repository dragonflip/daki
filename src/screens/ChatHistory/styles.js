import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  messageDateChip: {
    alignSelf: "center",
    marginVertical: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderColor: "grey",
    borderWidth: 1,
  },
  messageDateChipText: {
    color: "grey",
  },

  messageFromMe: {
    backgroundColor: "#000",
    alignSelf: "flex-end",

    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 2,

    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,

    alignItems: "flex-end",
    flexDirection: "row",
  },
  messageTextFromMe: {
    color: "#fff",
    maxWidth: "80%",
  },

  messageToMe: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",

    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 2,

    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,

    alignItems: "flex-end",
    flexDirection: "row",
  },
  messageTextToMe: {
    color: "#000",
    maxWidth: "80%",
  },

  messageTime: {
    color: "#999",
    fontSize: 10,
    marginLeft: 12,
    marginRight: 1,
  },
});
