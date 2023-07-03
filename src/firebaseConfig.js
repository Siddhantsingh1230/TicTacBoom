// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5hGwQiCFXpPCTvTjguCNhwHH1LnxU1EY",
  authDomain: "tictacboom-by-siddhant.firebaseapp.com",
  projectId: "tictacboom-by-siddhant",
  storageBucket: "tictacboom-by-siddhant.appspot.com",
  messagingSenderId: "1016071974877",
  appId: "1:1016071974877:web:9a104ec012c2d3e57ad034",
  measurementId: "G-29C74YZG61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db } ;