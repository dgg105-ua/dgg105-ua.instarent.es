// trabajo.js
import { db } from "./firebaseConfig.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  orderBy,
  limit,
  query,
  where
} from "firebase/firestore";

const COLECCION = "trabajos";

/** Crea un trabajo con un ID incremental o el que tú decidas. */
// ...existing code...
export async function createTrabajo(tipo, descripcion) {
  try {
    if (!tipo || !descripcion) {
      console.log("Error: Faltan campos obligatorios.");
      return null;
    }

    const colRef = collection(db, COLECCION);

    // Verificar si el tipo ya existe
    const tipoQuery = query(colRef, where("tipo", "==", tipo));
    const tipoSnap = await getDocs(tipoQuery);

    if (!tipoSnap.empty) {
      console.log("Error: Ya existe un trabajo con este tipo.");
      return null;
    }

    // Buscar el último ID y sumarle 1
    const idQuery = query(colRef, orderBy("id", "desc"), limit(1));
    const idSnap = await getDocs(idQuery);

    let nuevoId = 1;
    if (!idSnap.empty) {
      const ultimo = idSnap.docs[0].data();
      nuevoId = ultimo.id + 1;
    }

    // Crear el nuevo trabajo
    const trabajoRef = doc(db, COLECCION, nuevoId.toString());
    const nuevoTrabajo = {
      id: nuevoId,
      tipo,
      descripcion
    };
    await setDoc(trabajoRef, nuevoTrabajo);

    console.log(`Trabajo creado con ID: ${nuevoId}`);
    return nuevoTrabajo; // <-- Devuelve el trabajo creado
  } catch (error) {
    console.error("Error al crear trabajo:", error);
    return null;
  }
}
// ...existing code...

export async function readTrabajo(id) {
  try {
    if (!id) {
      console.log("Error: Falta el ID.");
      return null;
    }
    const ref = doc(db, COLECCION, id.toString());
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe un trabajo con ese ID.");
      return null;
    }
    return snap.data();
  } catch (error) {
    console.error("Error al leer trabajo:", error);
    return null;
  }
}

export async function updateTrabajo(id, newData) {
  try {
    if (!id || !newData) {
      console.log("Error: Falta ID o datos para actualizar.");
      return;
    }
    const ref = doc(db, COLECCION, id.toString());
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe un trabajo con ese ID para actualizar.");
      return;
    }

    await updateDoc(ref, newData);
    console.log("Trabajo actualizado con éxito.");
  } catch (error) {
    console.error("Error al actualizar el trabajo:", error);
  }
}

export async function deleteTrabajo(id) {
  try {
    if (!id) {
      console.log("Error: Falta el ID del trabajo a eliminar.");
      return;
    }
    const ref = doc(db, COLECCION, id.toString());
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe un trabajo con ese ID.");
      return;
    }
    await deleteDoc(ref);
    console.log("Trabajo eliminado con éxito.");
  } catch (error) {
    console.error("Error al eliminar trabajo:", error);
  }
}
