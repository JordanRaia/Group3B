import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCJ-Q4UWbDZ1xsYZHleMK9Yiu6TWeWgDRA",
    authDomain: "group3b-38bd5.firebaseapp.com",
    projectId: "group3b-38bd5",
    storageBucket: "group3b-38bd5.appspot.com",
    messagingSenderId: "776507281649",
    appId: "1:776507281649:web:e15239267d87cc54729950",
    measurementId: "G-QKSBCGB838",
};

//initialize firebase app
const app = initializeApp(firebaseConfig);

//firebase realtime database
const db = getDatabase(app);

//firebase storage
const storage = getStorage();

//firebase authentication
const auth = getAuth();

export { db, storage, auth };
