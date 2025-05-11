// trabajador.js
import { db } from "./firebaseConfig.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where
} from "firebase/firestore";

/**
 * Asigna un trabajador (dni_trabajador) a un trabajo concreto, indicando un precio.
 */
export async function createTrabajador(dni_trabajador, id_trabajo, precio) {
  try {
    if (!dni_trabajador || !id_trabajo) {
      console.log("Error: Falta dni_trabajador o id_trabajo.");
      return;
    }

    // Podrías verificar que el trabajo existe en "trabajos" y que el usuario existe en "usuario".
    // Generamos un ID doc con dni_trabajador-id_trabajo (por ejemplo) o con addDoc
    const docId = `${dni_trabajador}_${id_trabajo}`;
    const ref = doc(db, "trabajador", docId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      console.log("Error: Ya existe ese registro de trabajador-trabajo.");
      return;
    }

    await setDoc(ref, {
      dni_trabajador,
      id_trabajo,
      precio: precio || 0
    });
    console.log("Trabajador asignado al trabajo con éxito.");
  } catch (error) {
    console.error("Error al crear trabajador:", error);
  }
}

export async function readTrabajador(docId) {
  try {
    const ref = doc(db, "trabajador", docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe ese registro de trabajador-trabajo.");
      return null;
    }
    return snap.data();
  } catch (error) {
    console.error("Error al leer trabajador:", error);
    return null;
  }
}

export async function updateTrabajador(docId, updatedData) {
  try {
    if (!docId || !updatedData) {
      console.log("Error: Falta docId o datos para actualizar.");
      return;
    }
    const ref = doc(db, "trabajador", docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe ese registro de trabajador.");
      return;
    }
    await setDoc(ref, updatedData, { merge: true });
    console.log("Trabajador actualizado con éxito.");
  } catch (error) {
    console.error("Error al actualizar trabajador:", error);
  }
}

export async function deleteTrabajador(docId) {
  try {
    if (!docId) {
      console.log("Error: Falta docId para eliminar.");
      return;
    }
    const ref = doc(db, "trabajador", docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe ese registro de trabajador.");
      return;
    }
    await deleteDoc(ref);
    console.log("Trabajador eliminado (relación con trabajo).");
  } catch (error) {
    console.error("Error al eliminar trabajador:", error);
  }
}

/**
 * Consulta todos los trabajos que tiene un trabajador dado su DNI
 */
export async function trabajosPorTrabajador(dni_trabajador) {
  try {
    const c = collection(db, "trabajador");
    const q = query(c, where("dni_trabajador", "==", dni_trabajador));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.log("Este trabajador no tiene trabajos asignados.");
      return [];
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error al obtener trabajos del trabajador:", error);
    return [];
  }
}
