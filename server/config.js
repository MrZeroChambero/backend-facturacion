// config.js
import express from "express";
//
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "facturacion",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const app = express();
const jwtSecret =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub21icmUiOiJwZXBpdG8iLCJhcGVsbGlkb3MiOiJqaW1lbmVzIiwibml2ZWwiOjEsImlhdCI6MTczNTg2ODE2NywiZXhwIjoxNzM1ODcxNzY3fQ.F3HdL8LswOzfXZxO6cmLxKDSWf94lFLYsOedIt4kJC8";

app.get("/check-db", async (req, res) => {
  try {
    // Intentamos hacer una consulta simple para verificar la conexión
    await db.query("SELECT 1");
    res.send("¡Conexión a la base de datos exitosa!");
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      res
        .status(500)
        .send("No se pudo conectar a la base de datos: conexión rechazada.");
    } else {
      res
        .status(500)
        .send("Ocurrió un error inesperado al conectar a la base de datos.");
    }
    console.error("Detalles del error:", error);
  }
});

export { db, app, jwtSecret };
