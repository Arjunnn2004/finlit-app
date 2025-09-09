import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDfUXWnGUi4Dh4iSvlLvtlRY0li0zPvcOA",
  authDomain: "finlit-b3f1f.firebaseapp.com",
  projectId: "finlit-b3f1f",
  storageBucket: "finlit-b3f1f.firebasestorage.app",
  messagingSenderId: "921824439994",
  appId: "1:921824439994:web:16e1f0a0592a62d2f51c83"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
