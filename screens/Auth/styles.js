import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    textTransform: "uppercase",
  },

  helper: {
    color: "grey",
  },

  input: {
    alignSelf: "stretch",
    height: 52,

    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 4,

    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 8,
  },

  button: {
    alignSelf: "stretch",
    backgroundColor: "#000",
    borderRadius: 8,

    marginHorizontal: 16,
    marginVertical: 4,
    height: 52,
  },

  buttonTouched: {
    backgroundColor: "#333",
  },

  buttonText: {
    color: "#fff",
    textTransform: "uppercase",
    textAlign: "center",
    lineHeight: 52,
  },
});
