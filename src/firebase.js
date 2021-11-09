import firebase from "firebase";
import { LogBox } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
};

// Initialize Firebase
const auth =
  firebase.apps.length === 0
    ? firebase.initializeApp(firebaseConfig).auth()
    : firebase.app().auth();

const db = firebase.firestore();
LogBox.ignoreLogs(["Setting a timer for a long period of time"]);

export { firebase, auth, db };
