// server.js
import express from 'express';
import cors from 'cors';
import { createUsuario, readUsuarioPorCorreo, readUsuario } from './usuario.js'; // Importar funciones necesarias
import { readVivienda, createVivienda } from './vivienda.js'; // Importar las funciones necesarias
import { readAllViviendas, getJobCategories, readAllTrabajadores } from './filters.js'; // Importar la función necesaria
import { createValoracionCasero, readValoracionCasero } from './valoracion_casero.js'; // Importar las funciones necesarias
import { collection, query, where, getDocs } from 'firebase/firestore'; // Importar funciones necesarias de Firebase
import { verificarInquilino } from './inquilino.js'; // Importar la función necesaria
import { buscarDniCaseroPorVivienda } from './casero.js'; // Importar la función desde casero.js
import { createTrabajador } from './trabajador.js'; // Importar la función desde trabajador.js
import { createTrabajo } from './trabajo.js'; // Asegúrate de importar la función
import { db } from './firebaseConfig.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Ruta para crear usuario
app.post('/api/usuarios', async (req, res) => {
  try {
    const { dni, nombre, apellidos, contrasena, correo, fecha_nacimiento, telefono } = req.body;
    await createUsuario(dni, nombre, apellidos, contrasena, correo, fecha_nacimiento, telefono);
    res.status(200).json({ message: "Usuario creado con éxito" });
  } catch (error) {
    console.error("Error en la API:", error);
    res.status(500).json({ error: "Error al crear el usuario" });
  }
});

// Ruta para iniciar sesión
app.post('/api/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // Verificar que se proporcionen ambos campos
    if (!correo || !contrasena) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    }

    // Buscar el usuario por correo
    const usuario = await readUsuarioPorCorreo(correo);

    // Verificar si el usuario existe
    if (!usuario) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    // Verificar si la contraseña coincide
    if (usuario.contrasena !== contrasena) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    // Si el inicio de sesión es exitoso, devolver los datos del usuario, incluyendo el DNI
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      usuario: {
        dni: usuario.dni, // Asegúrate de que el DNI esté en los datos del usuario
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        telefono: usuario.telefono,
        fecha_nacimiento: usuario.fecha_nacimiento,
      },
    });
  } catch (error) {
    console.error("Error en la API de login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para obtener todas las viviendas
app.get('/api/viviendas', async (req, res) => {
  try {
    const { precioMin, precioMax, numHabitaciones, numBanyos, valoracion } = req.query;

    const filtros = {};
    if (precioMin) filtros.precioMin = parseInt(precioMin, 10);
    if (precioMax) filtros.precioMax = parseInt(precioMax, 10);
    if (numHabitaciones) filtros.numHabitaciones = parseInt(numHabitaciones, 10);
    if (numBanyos) filtros.numBanyos = parseInt(numBanyos, 10);
    if (valoracion) filtros.valoracion = parseInt(valoracion, 10);

    const viviendas = await readAllViviendas(null, filtros);

    if (viviendas.length === 0) {
      return res.status(404).json({ message: "No hay viviendas disponibles" });
    }

    res.status(200).json({ viviendas });
  } catch (error) {
    console.error("Error en la API de viviendas:", error);
    res.status(500).json({ error: "Error al obtener las viviendas" });
  }
});

// Ruta para obtener una vivienda específica por ID
app.get('/api/viviendas/:id', async (req, res) => {
  try {
    const idVivienda = req.params.id;

    // Leer la vivienda por su ID
    const vivienda = await readVivienda(idVivienda);

    if (!vivienda) {
      return res.status(404).json({ message: "No se encontró la vivienda con el ID proporcionado" });
    }

    res.status(200).json(vivienda);
  } catch (error) {
    console.error("Error en la API de vivienda específica:", error);
    res.status(500).json({ error: "Error al obtener la vivienda" });
  }
});

// Ruta para crear una nueva valoración de casero
app.post('/api/valoraciones', async (req, res) => {
  try {
    const { dni_casero, dni_valorador, valoracion, descripcion } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!dni_casero || !dni_valorador || valoracion == null) {
      return res.status(400).json({
        error: "Faltan campos obligatorios: dni_casero, dni_valorador, valoracion.",
      });
    }

    // Llamar a la función para crear la valoración
    await createValoracionCasero(dni_casero, dni_valorador, valoracion, descripcion);

    res.status(200).json({
      message: "Valoración creada con éxito.",
    });
  } catch (error) {
    console.error("Error en la API de valoraciones:", error);
    res.status(500).json({
      error: "Error interno del servidor al crear la valoración.",
    });
  }
});

// Ruta para verificar si un usuario ha sido inquilino de una vivienda
app.get('/api/inquilinos', async (req, res) => {
  try {
    const { vivienda, dni } = req.query;

    if (!vivienda || !dni) {
      return res.status(400).json({ error: "Faltan parámetros: vivienda y dni son obligatorios." });
    }

    const esInquilino = await verificarInquilino(dni, vivienda);

    if (esInquilino) {
      return res.status(200).json({ esInquilino: true });
    } else {
      return res.status(404).json({ esInquilino: false });
    }
  } catch (error) {
    console.error("Error al verificar inquilino:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Ruta para obtener el DNI del casero asociado a una vivienda
app.get('/api/caseros/vivienda/:idVivienda', async (req, res) => {
  try {
    let idVivienda = req.params.idVivienda; // Cambiar a let para permitir la reasignación

    if (!idVivienda) {
      return res.status(400).json({ error: "El ID de la vivienda es obligatorio." });
    }

    idVivienda = parseInt(idVivienda, 10); // Convertir a número entero

    if (isNaN(idVivienda)) {
      return res.status(400).json({ error: "El ID de la vivienda debe ser un número válido." });
    }

    // Llamar a la función buscarDniCaseroPorVivienda
    const dniCasero = await buscarDniCaseroPorVivienda(idVivienda);

    if (dniCasero) {
      return res.status(200).json({ dniCasero });
    } else {
      return res.status(404).json({ error: "No se encontró un casero para esta vivienda." });
    }
  } catch (error) {
    console.error("Error al obtener el casero por vivienda:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Ruta para obtener las valoraciones de un casero por su DNI
app.get('/api/valoraciones/casero/:dniCasero', async (req, res) => {
  try {
    const { dniCasero } = req.params;

    if (!dniCasero) {
      return res.status(400).json({ error: "El DNI del casero es obligatorio." });
    }

    const valoraciones = await readValoracionCasero(dniCasero);

    // Obtener los nombres de los usuarios a partir de sus DNIs
    const usuarios = await Promise.all(
      valoraciones.map(async (valoracion) => {
        const usuario = await readUsuario(valoracion.dni_valorador); // Función para obtener usuario por DNI
        return {
          ...valoracion,
          nombre_valorador: usuario ? usuario.nombre : "Usuario desconocido",
        };
      })
    );

    res.status(200).json({ valoraciones: usuarios });
  } catch (error) {
    console.error("Error al obtener las valoraciones del casero:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Ruta para registrar una nueva vivienda
app.post('/api/viviendas', async (req, res) => {
  try {
    console.log(req.body); // Verifica los datos recibidos
    const {
      nombre,
      descripcion,
      precio,
      metrosCuadrados,
      numHabitaciones,
      numBanyos,
      tipo_calle,
      linea1,
      linea2,
      codpos,
      ciudad,
      provincia,
    } = req.body;
    
    // Asignar un valor por defecto para la imagen
    const imagen = "img/viviendas/" + nombre + "/" + nombre + ".jpg";

    // Llamar a la función para crear la vivienda
    await createVivienda({
      nombre,
      descripcion,
      precio,
      metrosCuadrados,
      numHabitaciones,
      numBanyos,
      tipo_calle,
      linea1,
      linea2,
      codpos,
      ciudad,
      provincia,
      imagen,
    });


    res.status(200).json({ message: "Vivienda registrada con éxito" });
  } catch (error) {
    console.error("Error en la API de registro de viviendas:", error);
    res.status(500).json({ error: "Error al registrar la vivienda" });
  }
});

app.post('/api/trabajadores', async (req, res) => {
  try {
    const { dni_trabajador, id_trabajo, precio } = req.body;
    if (!dni_trabajador || !id_trabajo || precio == null) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }
    await createTrabajador(dni_trabajador, id_trabajo, precio);
    res.status(200).json({ message: "Trabajador asignado al trabajo con éxito." });
  } catch (error) {
    console.error("Error en la API de trabajadores:", error);
    res.status(500).json({ error: "Error al asignar trabajador al trabajo." });
  }
});

app.get('/api/trabajos', async (req, res) => {
  try {
    const trabajosRef = collection(db, "trabajos");
    const snapshot = await getDocs(trabajosRef);
    const trabajos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(trabajos);
  } catch (error) {
    console.error("Error al obtener trabajos:", error);
    res.status(500).json({ error: "Error al obtener los trabajos." });
  }
});

app.post('/api/trabajos', async (req, res) => {
  try {
    const { tipo, descripcion } = req.body;
    if (!tipo || !descripcion) {
      return res.status(400).json({ error: "Faltan campos obligatorios: tipo y descripcion." });
    }
    const nuevoTrabajo = await createTrabajo(tipo, descripcion);
    if (!nuevoTrabajo) {
      return res.status(400).json({ error: "Ya existe un trabajo con este tipo o error al crear." });
    }
    res.status(200).json({ trabajo: nuevoTrabajo });
  } catch (error) {
    console.error("Error al crear trabajo:", error);
    res.status(500).json({ error: "Error al crear el trabajo." });
  }
});

// Ruta para obtener un usuario por su DNI
app.get('/api/usuarios/:dni', async (req, res) => {
  try {
    const { dni } = req.params;

    if (!dni) {
      return res.status(400).json({ error: "El DNI es obligatorio." });
    }

    // Llamar a la función para obtener el usuario por DNI
    const usuario = await readUsuario(dni);

    if (!usuario) {
      return res.status(404).json({ error: "No se encontró un usuario con el DNI proporcionado." });
    }

    res.status(200).json({
      dni: usuario.dni,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos, // Asegúrate de incluir los apellidos
      correo: usuario.correo,
      telefono: usuario.telefono,
    });
  } catch (error) {
    console.error("Error al obtener el usuario por DNI:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});


// Ruta para obtener todos los trabajadores
app.get('/api/trabajadores', async (req, res) => {
  try {
    const { categoria } = req.query; // Obtener la categoría del query parameter
    const trabajadores = await readAllTrabajadores(categoria); // Pasar la categoría a la función
    
    res.status(200).json(trabajadores);
  } catch (error) {
    console.error("Error al obtener trabajadores:", error);
    res.status(500).json({ error: "Error al obtener los trabajadores." });
  }
});

// Ruta para obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuariosRef = collection(db, "usuario");
    const snapshot = await getDocs(usuariosRef);
    const usuarios = snapshot.docs.map(doc => ({ dni: doc.id, ...doc.data() })); // Include DNI as part of the response
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener los usuarios." });
  }
});

// Ruta para obtener categorías de trabajos
app.get('/api/categorias', async (req, res) => {
  try {
    const categorias = await getJobCategories();
    res.status(200).json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías." });
  }
});