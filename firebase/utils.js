// utils.js
import { getDoc, doc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

// ----------------------------------
// VALIDACIONES BÁSICAS DE CAMPOS
// ----------------------------------
export function validarContraseña(contrasena) {
  const regex = /^(?=.*[a-zA-Z])(?=.*\W).{8,}$/;
  return regex.test(contrasena);
}

export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validarTelefono(telefono) {
  const regex = /^\d{6,}$/;
  return regex.test(telefono);
}

/**
 * Valida un código postal, ciudad y provincia con la API de Zippopotam.us
 * @param {string} codigoPostal 
 * @param {string} ciudad 
 * @param {string} provincia 
 * @param {string} [pais='ES']  país por defecto ES (España)
 * @returns {boolean} true si concuerdan, false si no.
 */
export async function validarDireccion(codigoPostal, ciudad, provincia, pais = 'ES') {
  try {
    const respuesta = await fetch(`https://api.zippopotam.us/${pais}/${codigoPostal}`);
    
    if (!respuesta.ok) {
      console.log("Código postal no válido o no encontrado.");
      return false;
    }

    const data = await respuesta.json();
    console.log(data);

    // Verifica si la ciudad y la provincia coinciden con el código postal
    const validCity = data.places.some(
      place => place['place name'].toLowerCase() === ciudad.toLowerCase()
    );
    const validProvince = data.places.some(
      place => place.state.toLowerCase().includes(provincia.toLowerCase())
    );

    if (!validCity && !validProvince) {
      console.log("La ciudad y/o la provincia no coinciden con el código postal.");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error al consultar el código postal:", error);
    return false;
  }
}

// utils.js
export async function obtenerCiudadProvincia(codpos, pais = "ES") {
  try {
    const url = `https://api.zippopotam.us/${pais}/${codpos}`;
    const resp = await fetch(url);

    if (!resp.ok) {
      console.log(`No se encontró el código postal ${codpos} en ${pais}`);
      return null;
    }

    const data = await resp.json();

    if (!data.places || data.places.length === 0) {
      console.log(`La respuesta de Zippopotam.us no contenía lugares para el código postal ${codpos}`);
      return null;
    }

    // Tomamos la primera coincidencia
    const place = data.places[0];
    const city = place["place name"]; 
    const state = place["state"];

    return { city, state };
  } catch (error) {
    console.error("Error en obtenerCiudadProvincia:", error);
    return null;
  }
}

export async function inquilinoActualmenteOcupado(dniInquilino) {
  const ref = collection(db, "inquilino");
  const q = query(ref, where("DNI_Inquilino", "==", dniInquilino));
  const snap = await getDocs(q);

  if (snap.empty) return false;

  const hoy = new Date();

  for (const docu of snap.docs) {
    const data = docu.data();
    if (!data.fecha_entrada || !data.fecha_salida) continue; 
    // Si no hay ambas fechas, salta

    const fe = new Date(data.fecha_entrada);
    const fs = new Date(data.fecha_salida);

    // Si hoy está entre fe y fs (inclusive)
    if (hoy >= fe && hoy <= fs) {
      return true; 
    }
  }
  return false;
}

// ----------------------------------
// COMPROBAR EXISTENCIA DE DOCUMENTOS
// ----------------------------------
export async function existeDocumento(coleccion, id) {
  const ref = doc(db, coleccion, id);
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function existeValorEnCampo(coleccion, campo, valor) {
  const c = collection(db, coleccion);
  const q = query(c, where(campo, "==", valor));
  const snap = await getDocs(q);
  return !snap.empty;
}

// ----------------------------------
// EVITAR 2 CASEROS EN LA MISMA VIVIENDA
// ----------------------------------
export async function validarViviendaLibre(idVivienda) {
  // Si en la colección "casero" hay un doc con "Id_vivienda" == idVivienda, 
  // quiere decir que esa vivienda ya tiene casero.
  const ref = collection(db, "casero");
  const q = query(ref, where("Id_vivienda", "==", idVivienda));
  const snap = await getDocs(q);

  if (!snap.empty) {
    // Encontró al menos un casero para esa vivienda
    return false;
  }
  return true;
}

// ----------------------------------
// EVITAR AUTOALQUILER
// ----------------------------------
export async function validarNoAutoAlquiler(dniInquilino, idVivienda) {
  // Si "casero" tiene un doc con (DNI_Casero === dniInquilino y Id_vivienda === idVivienda),
  // significa que se intenta autoalquilar.
  const c = collection(db, "casero");
  const qCasero = query(
    c,
    where("DNI_Casero", "==", dniInquilino),
    where("Id_vivienda", "==", idVivienda)
  );
  const snap = await getDocs(qCasero);

  // Si !snap.empty => ya es casero -> autoalquiler
  return snap.empty; // true si está vacío (permitido), false si NO
}

// ----------------------------------
// VERIFICAR QUE UN USUARIO (DNI) SEA INQUILINO Y TENGA FECHAS
// ----------------------------------
export async function validarInquilinoConFechas(dniInquilino) {
  // Busca en "inquilino" un doc con (DNI_Inquilino == dniInquilino) y 
  // que tenga fecha_entrada y fecha_salida (no nulos).
  const ref = collection(db, "inquilino");
  const q = query(ref, where("DNI_Inquilino", "==", dniInquilino));
  const snap = await getDocs(q);

  if (snap.empty) return false;

  // Verificamos si al menos uno de los docs tiene fecha_entrada y fecha_salida
  for (const docu of snap.docs) {
    const data = docu.data();
    if (data.fecha_entrada && data.fecha_salida) {
      return true; // con que uno cumpla, ya vale
    }
  }
  return false;
}

// ----------------------------------
// VERIFICAR QUE UN USUARIO (DNI) SEA CASERO DE ALGUNA VIVIENDA
// ----------------------------------
export async function validarCaseroAsignado(dniCasero) {
  // Si en "casero" hay un doc con DNI_Casero == dniCasero, entonces efectivamente es un casero
  const ref = collection(db, "casero");
  const q = query(ref, where("DNI_Casero", "==", dniCasero));
  const snap = await getDocs(q);
  return !snap.empty;
}
