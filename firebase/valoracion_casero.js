// valoracion_casero.js
import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import { validarInquilinoConFechas } from "./utils.js";

/**
 * Crea (o actualiza) la valoración que un INQUILINO (dni_valorador) 
 * hace sobre un casero (dni_casero).
 * Regla: No se pueden duplicar valoraciones. Si ya existe, se actualiza.
 * Regla adicional: Solo si el inquilino tiene al menos un alquiler con fecha_entrada / fecha_salida.
 */
export async function createValoracionCasero(dni_casero, dni_valorador, valoracion, descripcion) {
  try {
    if (!dni_casero || !dni_valorador || valoracion == null) {
      console.log("Error: Faltan campos obligatorios (dni_casero, dni_valorador, valoracion).");
      return;
    }

    // Verificar que el "valorador" sea un inquilino con fechas
    const esInquilinoValido = await validarInquilinoConFechas(dni_valorador);
    if (!esInquilinoValido) {
      console.log(`Error: El usuario ${dni_valorador} NO tiene alquiler con fecha de entrada y salida.`);
      return;
    }

    // Verificar si ya existe una valoración [dni_casero, dni_valorador]
    const refColl = collection(db, "valoracion_casero");
    const qExist = query(
      refColl,
      where("dni_casero", "==", dni_casero),
      where("dni_valorador", "==", dni_valorador)
    );
    const snapExist = await getDocs(qExist);

    if (!snapExist.empty) {
      // Ya existe una valoración de este valorador -> actualizamos la primera que encontremos
      const docToUpdate = snapExist.docs[0];
      const docRef = doc(db, "valoracion_casero", docToUpdate.id);
      await updateDoc(docRef, {
        valoracion,
        descripcion: descripcion || ""
      });
      console.log(`Valoración de casero actualizada para ${dni_valorador} → ${dni_casero}.`);
      return;
    }

    // Si no existe, la creamos
    const newDocRef = await addDoc(refColl, {
      dni_casero,
      dni_valorador,
      valoracion,
      descripcion: descripcion || ""
    });
    console.log("Valoración de casero creada con ID:", newDocRef.id);

  } catch (error) {
    console.error("Error al crear/actualizar valoración casero:", error);
  }
}

/**
 * Lee valoraciones de casero, opcionalmente filtrando por dni_casero
 */
export async function readValoracionCasero(dniCasero) {
  try {
    const ref = collection(db, "valoracion_casero");
    if (!dniCasero) {
      // Trae todas
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      const q = query(ref, where("dni_casero", "==", dniCasero));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (error) {
    console.error("Error al leer valoraciones de casero:", error);
    return [];
  }
}

/**
 * Actualiza una valoración de casero por ID de documento
 */
export async function updateValoracionCasero(docId, newValoracion, newDescripcion) {
  try {
    const ref = doc(db, "valoracion_casero", docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe esa valoración de casero.");
      return;
    }
    await updateDoc(ref, {
      valoracion: newValoracion,
      descripcion: newDescripcion || ""
    });
    console.log("Valoración de casero actualizada con éxito.");
  } catch (error) {
    console.error("Error al actualizar valoración de casero:", error);
  }
}

/**
 * Elimina una valoración por ID de documento
 */
export async function deleteValoracionCasero(docId) {
  try {
    const ref = doc(db, "valoracion_casero", docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe esa valoración de casero.");
      return;
    }
    await deleteDoc(ref);
    console.log("Valoración de casero eliminada con éxito.");
  } catch (error) {
    console.error("Error al eliminar valoración de casero:", error);
  }
}
