import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase (reemplaza con tus datos)
const firebaseConfig = {
    apiKey: "AIzaSyB4160MOX7NBtQ6B78RQKE2hlbIQBdlic0",
    authDomain: "taes-el-verdadero-dos-pa.firebaseapp.com",
    databaseURL: "https://taes-el-verdadero-dos-pa-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "taes-el-verdadero-dos-pa",
    storageBucket: "taes-el-verdadero-dos-pa.firebasestorage.app",
    messagingSenderId: "1066361758589",
    appId: "1:1066361758589:web:a135b8b9792b372dc8a214",
    measurementId: "G-8SPWTNXW0R"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
