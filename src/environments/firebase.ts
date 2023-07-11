// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAp7Xfzd-OJwp4I5UmuJg3WGaMXRPVtiRM",
  authDomain: "kampala-fresh-loaf.firebaseapp.com",
  projectId: "kampala-fresh-loaf",
  storageBucket: "kampala-fresh-loaf.appspot.com",
  messagingSenderId: "139542851133",
  appId: "1:139542851133:web:f8790c64799bad40d44454",
  measurementId: "G-PE08R9511T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
