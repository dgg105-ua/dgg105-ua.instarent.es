// test.js
import { db } from "./firebaseConfig.js";

// --- Imports de CRUD ---
import { createUsuario } from "./usuario.js";
import { createVivienda, readVivienda } from "./vivienda.js";
import { createCasero, readCasero } from "./casero.js";
import { createInquilino, readInquilino } from "./inquilino.js";
import { createTrabajo } from "./trabajo.js";
import { createTrabajador, trabajosPorTrabajador } from "./trabajador.js";
import { createValoracionCasero, readValoracionCasero } from "./valoracion_casero.js";
import { createValoracionInquilino, readValoracionInquilino } from "./valoracion_inquilino.js";
import { createContrata, readContrata, deleteContrata } from "./contrata.js";
import { readAllUsuarios, readAllViviendas, readAllTrabajadores }  from "./filters.js";

/**
 * 1. Crear 10 usuarios:
 *   - 2 caseros (C1, C2)
 *   - 2 trabajadores (T1, T2)
 *   - 6 inquilinos (I1...I6)
 */
async function testCrearUsuarios() {
  console.log("\n--- CREANDO 2 CASEROS ---");
  await createUsuario("99999999C", "Casero1", "ApellidoC1", "Pass*Caser1", "cas1@example.com", "1970-01-01", "610000001");
  await createUsuario("88888888C", "Casero2", "ApellidoC2", "Pass*Caser2", "cas2@example.com", "1975-01-01", "610000002");

  console.log("\n--- CREANDO 2 TRABAJADORES ---");
  await createUsuario("77777777T", "Trabajador1", "ApellidoT1", "Pass*Trab1", "trab1@example.com", "1980-01-01", "610000003");
  await createUsuario("66666666T", "Trabajador2", "ApellidoT2", "Pass*Trab2", "trab2@example.com", "1985-01-01", "610000004");

  console.log("\n--- CREANDO 6 INQUILINOS ---");
  await createUsuario("55555555I", "Inq1", "ApellidoI1", "Pass*Inq1", "inq1@example.com", "1990-01-01", "610000005");
  await createUsuario("44444444I", "Inq2", "ApellidoI2", "Pass*Inq2", "inq2@example.com", "1991-01-01", "610000006");
  await createUsuario("33333333I", "Inq3", "ApellidoI3", "Pass*Inq3", "inq3@example.com", "1992-01-01", "610000007");
  await createUsuario("22222222I", "Inq4", "ApellidoI4", "Pass*Inq4", "inq4@example.com", "1993-01-01", "610000008");
  await createUsuario("11111111I", "Inq5", "ApellidoI5", "Pass*Inq5", "inq5@example.com", "1994-01-01", "610000009");
  await createUsuario("01010101I", "Inq6", "ApellidoI6", "Pass*Inq6", "inq6@example.com", "1995-01-01", "610000010");

  console.log("\n--- CREANDO 4 NUEVOS INQUILINOS ---");
  await createUsuario("12121212I", "Inq7", "ApellidoI7", "Pass*Inq7", "inq7@example.com", "1996-01-01", "610000011");
  await createUsuario("13131313I", "Inq8", "ApellidoI8", "Pass*Inq8", "inq8@example.com", "1997-01-01", "610000012");
  await createUsuario("14141414I", "Inq9", "ApellidoI9", "Pass*Inq9", "inq9@example.com", "1998-01-01", "610000013");
  await createUsuario("15151515I", "Inq10", "ApellidoI10", "Pass*Inq10", "inq10@example.com", "1999-01-01", "610000014");
}

/**
 * 2. Crear 6 viviendas:
 *   - Asignar 2 de ellas al mismo casero (99999999C) → demuestra que un casero puede tener varias.
 *   - La 3ra se asigna al otro casero (88888888C).
 *   - Se valida que no se duplique un casero en la misma vivienda.
 */
async function testViviendasCaseros() {
  console.log("\n--- CREANDO 3 VIVIENDAS ---");

  // Vivienda 1
  await createVivienda({
    id_vivienda: 1,
    nombre: "ViviendaA",
    descripcion: "Piso grande",
    precio: 800,
    metrosCuadrados: 100,
    numHabitaciones: 3,
    numBanyos: 2,
    extras: ["terraza"],
    tipo_calle: "Avenida",
    linea1: "Primera 11",
    codpos: "03315",
    ciudad: "La Murada",
    provincia: "Comunidad Valenciana",
    imagen: "img/viviendas/vivienda1/vivienda1.jpg"
  });

  // Vivienda 2
  await createVivienda({
    id_vivienda: 2,
    nombre: "ViviendaB",
    descripcion: "Ático con vistas",
    precio: 1200,
    metrosCuadrados: 80,
    numHabitaciones: 2,
    numBanyos: 1,
    extras: ["piscina"],
    tipo_calle: "Calle",
    linea1: "Segunda 22",
    codpos: "28002",
    ciudad: "Madrid",
    provincia: "Madrid",
    imagen: "img/viviendas/vivienda2/vivienda2.jpg"
  });

  // Vivienda 3
  await createVivienda({
    id_vivienda: 3,
    nombre: "ViviendaC",
    descripcion: "Chalet familiar",
    precio: 1500,
    metrosCuadrados: 120,
    numHabitaciones: 4,
    numBanyos: 3,
    extras: [],
    tipo_calle: "Calle",
    linea1: "Tercera 33",
    codpos: "28003", // Código postal corregido
    ciudad: "Madrid",
    provincia: "Madrid",
    imagen: "img/viviendas/vivienda3/vivienda3.jpg"
  });

  // Vivienda 4
  await createVivienda({
    id_vivienda: 4,
    nombre: "ViviendaD",
    descripcion: "Casa rural",
    precio: 600,
    metrosCuadrados: 90,
    numHabitaciones: 3,
    numBanyos: 1,
    extras: ["jardín", "chimenea"],
    tipo_calle: "Camino",
    linea1: "Cuarta 44",
    codpos: "45001", // Código postal corregido
    ciudad: "Toledo",
    provincia: "Castilla-La Mancha",
    imagen: "img/viviendas/vivienda4/vivienda4.jpg"
  });

  // Vivienda 5
  await createVivienda({
    id_vivienda: 5,
    nombre: "ViviendaE",
    descripcion: "Dúplex moderno",
    precio: 2000,
    metrosCuadrados: 150,
    numHabitaciones: 5,
    numBanyos: 3,
    extras: ["garaje", "terraza"],
    tipo_calle: "Calle",
    linea1: "Quinta 55",
    codpos: "08001", // Código postal corregido
    ciudad: "Barcelona",
    provincia: "Cataluña",
    imagen: "img/viviendas/vivienda5/vivienda5.jpg"
  });

  // Vivienda 6
  await createVivienda({
    id_vivienda: 6,
    nombre: "ViviendaF",
    descripcion: "Estudio céntrico",
    precio: 500,
    metrosCuadrados: 40,
    numHabitaciones: 1,
    numBanyos: 1,
    extras: ["ascensor"],
    tipo_calle: "Plaza",
    linea1: "Sexta 66",
    codpos: "28006",
    ciudad: "Valencia",
    provincia: "Comunidad Valenciana",
    imagen: "img/viviendas/vivienda6/vivienda6.jpg"
  });

  const data = await readVivienda(1);
  console.log("Datos de la vivienda leída:", data);

  console.log("\n--- ASIGNANDO VIVIENDAS A LOS CASEROS ---");
  // Asignar vivienda 1 y 2 al casero 99999999C
  await createCasero("99999999C", 1);
  await createCasero("99999999C", 2);

  // Asignar vivienda 3 al casero 88888888C
  await createCasero("88888888C", 3);

  // Asignar vivienda 4 al casero 99999999C
  await createCasero("99999999C", 4);

  // Asignar vivienda 5 al casero 88888888C
  await createCasero("88888888C", 5);

  // Ejemplo fallido: asignar otra vez la vivienda 1 al mismo casero → ya existe
  console.log("\n--- PROBANDO DUPLICAR CASERO EN MISMA VIVIENDA (DEBE FALLAR) ---");
  await createCasero("88888888C", 1); // Esperamos: "Error: La vivienda 1 ya tiene un casero asignado"
}

/**
 * 3. Crear inquilinos para cada vivienda:
 *   - Evitar autoalquiler (un casero no puede inquilino en su propia vivienda).
 *   - Evitar inquilino doble: si la fecha actual cae en un rango, no se crea otra.
 *   - Asignamos:
 *     * 2 inquilinos a la vivienda 1
 *     * 2 inquilinos a la vivienda 2
 *     * 2 inquilinos a la vivienda 3
 */
import { inquilinoActualmenteOcupado } from "./utils.js";

async function testInquilinos() {
  console.log("\n--- CREANDO INQUILINOS ---");
  // Vivienda 1 => Casero = 99999999C
  // Intentemos meter un inquilino "autoalquiler" con 99999999C => debe fallar
  console.log("\n--- AUTOALQUILER FALLIDO (CASERO = INQUILINO) ---");
  await createInquilino("99999999C", 1, "2025-01-01", "2025-12-31", "Contrato autoalquiler?");

  // Metemos inquilino normal
  await createInquilino("55555555I", 1, "2025-01-01", "2025-12-31", "Contrato 55555555I con casa1");
  await createInquilino("44444444I", 1, "2025-01-05", "2025-06-30", "Contrato 44444444I con casa1");

  // Vivienda 2 => Casero = 99999999C
  await createInquilino("33333333I", 2, "2025-02-01", "2025-09-01", "Contrato 33333333I con casa2");
  await createInquilino("22222222I", 2, "2026-01-01", "2026-05-30", "Contrato 22222222I con casa2");

  // Vivienda 3 => Casero = 88888888C
  await createInquilino("11111111I", 3, "2025-03-01", "2025-07-31", "Contrato 11111111I con casa3");
  await createInquilino("01010101I", 3, "2026-02-01", "2026-12-31", "Contrato 01010101I con casa3");

  // Chequear si alguno está "ocupado" en la fecha actual
  console.log("\n--- PROBANDO SI ALGUNO ESTÁ ACTIVO HOY ---");
  const yaOcupado5555 = await inquilinoActualmenteOcupado("55555555I");
  console.log("¿Está 55555555I actualmente en un alquiler activo?", yaOcupado5555);

  // Intento forzar un inquilino "doble" en la fecha actual.
  // Por ejemplo, la fecha actual supón que es (por ejemplo) 2025-05-01,
  // 44444444I ya tiene un rango "2025-01-05" a "2025-06-30".
  // => Al crear uno nuevo hoy, debe fallar.
  console.log("\n--- INTENTANDO CREAR ALQUILER PARA 44444444I QUE YA ESTÁ ACTIVO (DEBE FALLAR) ---");
  await createInquilino("44444444I", 2, "2025-04-01", "2025-08-01", "Contrato duplicado en la misma época");

  console.log("\n--- CREANDO CONTRATOS PARA NUEVOS INQUILINOS ---");
  // Vivienda 1 => Casero = 99999999C
  await createInquilino("12121212I", 1, "2025-07-01", "2025-12-31", "Contrato 12121212I con casa1");
  await createInquilino("13131313I", 1, "2026-01-01", "2026-06-30", "Contrato 13131313I con casa1");

  // Vivienda 3 => Casero = 88888888C
  await createInquilino("14141414I", 3, "2025-08-01", "2025-12-31", "Contrato 14141414I con casa3");
  await createInquilino("15151515I", 3, "2026-01-01", "2026-06-30", "Contrato 15151515I con casa3");
}

/**
 * 4. Crear trabajos y asignarlos a trabajadores
 *   - Evitar duplicados por (nombre,tipo) si deseas
 *   - Asignar 77777777T, 66666666T
 */
async function testTrabajosYTrabajadores() {
  console.log("\n--- CREANDO TRABAJOS ---");
  await createTrabajo("Fontanería", "Reparaciones de tuberías");
  await createTrabajo("Electricidad", "Instalaciones eléctricas");
  // Intento duplicar
  console.log("\n--- INTENTANDO DUPLICAR TRABAJO (OPCIONAL, SOLO SI LO IMPLEMENTAS) ---");
  await createTrabajo("Fontanería", "Otra descripción, pero mismo nombre/tipo.");

  console.log("\n--- ASIGNANDO TRABAJADORES A TRABAJOS ---");
  // Asigna a "Trabajador1" (77777777T) al trabajo ID=1 (Fontanería, si es la primera)
  await createTrabajador("77777777T", 1, 100);

  // Asigna a "Trabajador2" (66666666T) al trabajo ID=2 (Electricidad)
  await createTrabajador("66666666T", 2, 150);

  // Ver trabajos de un trabajador
  const trabajosDeT1 = await trabajosPorTrabajador("77777777T");
  console.log("Trabajos asignados a 77777777T:", trabajosDeT1);
}

/**
 * 5. Crear valoraciones
 *   - Inquilino con fechas valora a casero => se crea o actualiza
 *   - Casero valora a inquilino => se crea o actualiza
 *   - Mostrar casos fallidos (usuario no inquilino o no casero).
 */
async function testValoraciones() {
  console.log("\n--- VALORACIONES ---");
  // 55555555I (inquilino en vivienda 1) valora a 99999999C (casero)
  await createValoracionCasero("99999999C", "55555555I", 5, "El casero fue muy amable.");

  // Repetir la valoración, debe actualizar en vez de crear nuevo
  await createValoracionCasero("99999999C", "55555555I", 3, "Actualizo mi valoración: tuve problemas con la caldera.");

  // 99999999C (casero) valora a 55555555I (inquilino)
  await createValoracionInquilino("55555555I", "99999999C", 4, "Buen inquilino, paga puntual.", "2025-12-31");

  // Repetir para actualizar
  await createValoracionInquilino("55555555I", "99999999C", 2, "Actualizando la valoración: tardó en limpiar.");

  // Caso fallido: un inquilino que NO tiene fecha de salida no puede valorar
  // Ej: 44444444I (tiene una fecha de salida, pero supongamos no la tuviera).
  console.log("\n--- VALORACION FALLIDA (INQUILINO SIN FECHAS COMPLETAS) ---");
  await createInquilino("44444444I", 3, "2027-01-01", null, "Contrato sin fecha_salida"); 
  await createValoracionCasero("88888888C", "44444444I", 5, "No debería poder valorar si no tiene 'fecha_salida'");

  // Caso fallido: un inquilino valorando a otro inquilino
  console.log("\n--- VALORACION FALLIDA (NO CASERO INTENTANDO VALORAR INQUILINO) ---");
  await createValoracionInquilino("33333333I", "55555555I", 3, "Inquilino valorando a otro inquilino: ERROR");

  console.log("\n--- MÁS VALORACIONES A CASEROS ---");
  // Más valoraciones para el casero 99999999C
  await createValoracionCasero("99999999C", "33333333I", 4, "El casero fue muy atento.");
  await createValoracionCasero("99999999C", "22222222I", 5, "Excelente trato y comunicación.");
  await createValoracionCasero("99999999C", "12121212I", 3, "Tuve algunos problemas, pero los resolvió.");
  await createValoracionCasero("99999999C", "13131313I", 4, "Buena experiencia en general.");

  // Más valoraciones para el casero 88888888C
  await createValoracionCasero("88888888C", "44444444I", 5, "Muy profesional y amable.");
  await createValoracionCasero("88888888C", "55555555I", 4, "El casero fue puntual y responsable.");
  await createValoracionCasero("88888888C", "14141414I", 3, "Hubo algunos inconvenientes, pero se solucionaron.");
  await createValoracionCasero("88888888C", "15151515I", 5, "Excelente experiencia, muy recomendado.");
}

/**
 * 6. Pruebas de contratación (contrata.js)
 *    - Creamos varias contrataciones secuenciales, comprobamos IDs.
 *    - Leemos la contratación creada.
 *    - Borramos una y confirmamos que ya no existe.
 */
async function testContrataciones() {
  // 1) Crear primera contratación (ID=1), ej: inquilino "55555555I" contrata a trabajador "77777777T"
  await createContrata("55555555I", "77777777T");
  // Leer para verificar
  let c1 = await readContrata(1);
  console.log("Contratación con ID=1:", c1);

  // 2) Crear segunda contratación (ID=2)
  await createContrata("44444444I", "66666666T");
  let c2 = await readContrata(2);
  console.log("Contratación con ID=2:", c2);
}

async function testReadUsuarios(tipo=null) {
  console.log("\n--- LEYENDO USUARIOS ---");
  const usuarios = await readAllUsuarios(tipo);
  console.log("Usuarios:", usuarios);
}

async function testReadViviendas(tipo=null, filtro=null, filtro2=null) {
  console.log("\n--- LEYENDO VIVIENDAS ---");
  const viviendas = await readAllViviendas(tipo, filtro, filtro2);
  console.log("Viviendas:", viviendas);
}

async function testReadTrabajadores(tipo=null) {
  console.log("\n--- LEYENDO TRABAJADORES ---");
  const trabajadores = await readAllTrabajadores(tipo);
  console.log("Trabajadores:", trabajadores);
}

/**
 * MAIN: Ejecuta todo en orden
 */
async function main() {
  try {
    
    console.log("--- TEST CREAR USUARIOS ---");
    await testCrearUsuarios();

    console.log("\n--- TEST CREAR VIVIENDAS Y CASEROS ---");
    await testViviendasCaseros();

    console.log("\n--- TEST CREAR INQUILINOS (AUTOALQUILER, DOBLE ALQUILER, ETC.) ---");
    await testInquilinos();

    console.log("\n--- TEST CREAR TRABAJOS Y TRABAJADORES ---");
    await testTrabajosYTrabajadores();

    console.log("\n--- TEST VALORACIONES ---");
    await testValoraciones();

    console.log("\n--- TEST CONTRATACIONES ---");
    await testContrataciones();
    await testReadUsuarios("casero");
    await testReadViviendas("precio", 200, 801);
    await testReadTrabajadores("Fontanería");

    console.log("\n--- FIN DE LAS PRUEBAS ---");
  } catch (err) {
    console.error("Error global en test.js:", err);
  }
}

main()
  .then(() => console.log("\n--- EJECUCIÓN COMPLETA DE test.js ---"))
  .catch(err => console.error("Error final en test.js:", err));
