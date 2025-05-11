// test.js (o cleanup.js)
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

async function deleteAllDocsInCollection(collectionName) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);

  if (snapshot.empty) {
    console.log(`La colección "${collectionName}" ya está vacía.`);
    return;
  }

  for (const document of snapshot.docs) {
    await deleteDoc(doc(db, collectionName, document.id));
    console.log(`Eliminado doc con ID "${document.id}" de la colección "${collectionName}"`);
  }
  console.log(`\nColección "${collectionName}" vaciada con éxito.\n`);
}

// Esta función invoca la anterior para cada colección que quieras limpiar
async function cleanDatabase() {
  // Añade aquí las colecciones que has usado en tu proyecto
  const collections = [
    "usuario",
    "vivienda",
    "casero",
    "inquilino",
    "trabajos",
    "trabajador",
    "contrata",
    "valoracion_casero",
    "valoracion_inquilino"
    // ...agrega más si las necesitas
  ];

  for (const col of collections) {
    await deleteAllDocsInCollection(col);
  }
}

// Ejemplo de uso en un test
async function main() {
  try {
    console.log("--- LIMPIANDO LA BASE DE DATOS ---");
    await cleanDatabase();

    console.log("--- BASE DE DATOS LIMPIA, AHORA CREAMOS DE NUEVO ---");
    // Aquí vuelves a llamar a tus funciones de test que crean usuarios, viviendas, etc.
    // Por ejemplo:
    // await crear10Usuarios();
    // await crearViviendasYCaseros();
    // ...
  } catch (error) {
    console.error("Error en main:", error);
  }
}

main()
  .then(() => console.log("\n--- FINALIZÓ LA LIMPIEZA Y CREACIÓN ---"))
  .catch(err => console.error("Error global:", err));
