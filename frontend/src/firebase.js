import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAKWZxhOZ2qqJGQKC2O6pHLOese1XULYlE",
  authDomain: "python-quest-app-84f96.firebaseapp.com",
  projectId: "python-quest-app-84f96",
  storageBucket: "python-quest-app-84f96.firebasestorage.app",
  messagingSenderId: "448254515931",
  appId: "1:448254515931:web:f2bfe6efca4931cc3e0afe"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)