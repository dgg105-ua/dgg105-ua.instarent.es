// usuario.js
import { db } from "./firebaseConfig.js";
import { doc, setDoc, getDoc, deleteDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import {
  validarContraseña,
  validarEmail,
  validarTelefono,
  existeDocumento,
  existeValorEnCampo,
} from "./utils.js";

const COLECCION = "usuario";

/**
 * Crea un nuevo usuario (dni como ID del documento).
 * @param {string} dni 
 * @param {string} nombre 
 * @param {string} apellidos 
 * @param {string} contrasena 
 * @param {string} correo 
 * @param {string} fecha_nacimiento 
 * @param {string} telefono 
 */
export async function createUsuario(dni, nombre, apellidos, contrasena, correo, fecha_nacimiento, telefono) {
  try {
    // Validaciones básicas
    if (!dni || !nombre || !apellidos || !contrasena) {
      throw new Error("Error: Faltan campos obligatorios (dni, nombre, apellidos, contrasena).");
      return;
    }
    if (correo && !validarEmail(correo)) {
      throw new Error("Error: Formato de correo inválido.");
      return;
    }
    if (telefono && !validarTelefono(telefono)) {
      throw new Error("Error: Formato de teléfono inválido.");
      return;
    }
    if (!validarContraseña(contrasena)) {
      throw new Error("Error: La contraseña no cumple con los requisitos mínimos.");
      return;
    }

    // Verificar si el usuario ya existe por dni
    if (await existeDocumento(COLECCION, dni)) {
      throw new Error("Error: Ya existe un usuario con este DNI.");
      return;
    }

    // Verificar si el correo ya está en uso
    if (correo && (await existeValorEnCampo(COLECCION, "correo", correo))) {
      throw new Error("Error: Ya existe un usuario con este correo.");
      return;
    }

    // Verificar si el teléfono ya está en uso
    if (telefono && (await existeValorEnCampo(COLECCION, "telefono", telefono))) {
      throw new Error("Error: Ya existe un usuario con este teléfono.");
      return;
    }

    // Crear usuario
    const usuarioRef = doc(db, COLECCION, dni);
    await setDoc(usuarioRef, {
      nombre,
      apellidos,
      contrasena, // Almacena un hash en producción
      correo: correo || null,
      fecha_nacimiento: fecha_nacimiento || null,
      telefono: telefono || null
    });

    console.log("Usuario creado con éxito.");
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    throw error; // Re-lanzar el error para manejarlo en otro lugar si es necesario
  }
}

export async function readUsuario(dni) {
  try {
    if (!dni) {
      console.log("Error: Debes proporcionar un DNI.");
      return null;
    }
    const ref = doc(db, COLECCION, dni);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe un usuario con ese DNI.");
      return null;
    }
    return snap.data();
  } catch (error) {
    console.error("Error al leer usuario:", error);
    return null;
  }
}

/**
 * Lee un usuario por correo electrónico.
 * @param {string} correo - El correo del usuario.
 * @returns {Promise<Object|null>} - Devuelve los datos del usuario si existe, o `null` si no se encuentra.
 */
export async function readUsuarioPorCorreo(correo) {
  try {
    if (!correo) {
      throw new Error("Error: Debes proporcionar un correo.");
    }

    // Crear una consulta para buscar el usuario por correo
    const usuariosRef = collection(db, "usuario");
    const q = query(usuariosRef, where("correo", "==", correo));
    const querySnapshot = await getDocs(q);

    // Verificar si el correo existe
    if (querySnapshot.empty) {
      console.log("No existe un usuario con este correo.");
      return null;
    }

    // Retornar los datos del usuario encontrado, incluyendo el ID del documento (DNI)
    let usuarioEncontrado = null;
    querySnapshot.forEach((doc) => {
      usuarioEncontrado = { ...doc.data(), dni: doc.id }; // Incluye el ID del documento como DNI
    });

    return usuarioEncontrado;
  } catch (error) {
    console.error("Error al leer usuario por correo:", error);
    throw error; // Re-lanzar el error para manejarlo en otro lugar si es necesario
  }
}

export async function updateUsuario(dni, newData) {
  try {
    if (!dni || !newData) {
      console.log("Error: Faltan DNI o datos para actualizar.");
      return;
    }

    // Si se va a actualizar la contraseña, validarla
    if (newData.contrasena && !validarContraseña(newData.contrasena)) {
      console.log("Error: La contraseña no cumple los requisitos.");
      return;
    }
    if (newData.correo && !validarEmail(newData.correo)) {
      console.log("Error: El nuevo correo no es válido.");
      return;
    }
    if (newData.telefono && !validarTelefono(newData.telefono)) {
      console.log("Error: El nuevo teléfono no es válido.");
      return;
    }

    const ref = doc(db, COLECCION, dni);
    if (!(await existeDocumento(COLECCION, dni))) {
      console.log("No existe un usuario con ese DNI para actualizar.");
      return;
    }

    await updateDoc(ref, newData);
    console.log("Usuario actualizado con éxito.");
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
  }
}

export async function deleteUsuario(dni) {
  try {
    if (!dni) {
      console.log("Error: Debes proporcionar un DNI para eliminar.");
      return;
    }
    if (!(await existeDocumento(COLECCION, dni))) {
      console.log("No existe un usuario con ese DNI.");
      return;
    }

    const ref = doc(db, COLECCION, dni);
    await deleteDoc(ref);
    console.log("Usuario eliminado con éxito.");
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
  }
}

/**
 * Inicia sesión verificando el correo y la contraseña.
 * @param {string} correo - El correo del usuario.
 * @param {string} contrasena - La contraseña proporcionada.
 * @returns {Promise<boolean>} - Devuelve `true` si las credenciales son correctas, de lo contrario lanza un error.
 */
export async function loginUsuario(correo, contrasena) {
  try {
    if (!correo || !contrasena) {
      throw new Error("Error: Debes proporcionar un correo y una contraseña.");
    }

    // Crear una consulta para buscar el usuario por correo
    const usuariosRef = collection(db, "usuario");
    const q = query(usuariosRef, where("correo", "==", correo));
    const querySnapshot = await getDocs(q);

    // Verificar si el correo existe
    if (querySnapshot.empty) {
      throw new Error("Error: No existe un usuario con este correo.");
    }

    // Verificar la contraseña
    let usuarioEncontrado = null;
    querySnapshot.forEach((doc) => {
      usuarioEncontrado = doc.data();
    });

    if (usuarioEncontrado.contrasena !== contrasena) {
      throw new Error("Error: La contraseña es incorrecta.");
    }

    console.log("Inicio de sesión exitoso.");
    return true; // Credenciales correctas
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error; // Re-lanzar el error para manejarlo en otro lugar si es necesario
  }
}
