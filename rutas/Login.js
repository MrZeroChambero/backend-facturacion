import express from "express";
import bcrypt from "bcryptjs";
import Joi from "joi";
import jwt from "jsonwebtoken";
import {
  verifyLevelAdmin,
  verifyLevelMedium,
  verifyLevelLow,
  verifyToken,
} from "./VerificarNivel.js";
import { db, jwtSecret } from "../config.js";

const routerLogin = express.Router();

const verificarClave = async (plainTextPassword, hashedPassword) => {
  const esValida = await bcrypt.compare(plainTextPassword, hashedPassword);
  return esValida;
};

const encriptarClave = async (plainTextPassword) => {
  const saltRounds = 10; // Puedes ajustar este valor según tu necesidad
  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
  return hashedPassword;
};

const VerifyJson = (req, res, next) => {
  // Definición del esquema
  const noExtraSpaces = /^(?! )[a-zA-Z0-9 ]*(?<! )$/;

  const schema = Joi.object({
    usuario: Joi.string().pattern(noExtraSpaces).required().messages({
      "string.pattern.base":
        "El campo usuario solo puede contener letras, números y espacios simples, y no puede empezar ni terminar con un espacio.",
      "any.required": "El campo usuario es obligatorio.",
      "string.empty": "El campo usuario no puede estar vacío.",
    }),
    clave: Joi.string().pattern(noExtraSpaces).required().messages({
      "string.pattern.base":
        "El campo clave solo puede contener letras, números y espacios simples, y no puede empezar ni terminar con un espacio.",
      "any.required": "El campo clave es obligatorio.",
      "string.empty": "El campo clave no puede estar vacío.",
    }),
  })
    .unknown(false)
    .messages({ "object.unknown": "El campo {#label} no está permitido." });

  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    // Obtener todos los mensajes de error
    const messages = error.details.map((detail) => detail.message);
    const varaiblesError = error.details.map((detail) => detail.context.label);

    console.log(error.details);
    return res
      .status(400)
      .send({ res: false, msg: messages, varaiblesError: varaiblesError });
  } else {
    console.log("Datos validados correctamente:", value);
    next();
  }
};

// Ejemplo en la ruta de login
routerLogin.post("/", VerifyJson, async (req, res) => {
  console.log("Entro a la ruta de login");

  const { usuario, clave } = req.body;

  const claveEncriptada = await encriptarClave(clave);
  console.log(claveEncriptada);
  try {
    const querysql =
      "SELECT id, nombres, apellidos, nivel, clave FROM usuario WHERE nickname = ? AND estado = true";
    const [result] = await db.execute(querysql, [usuario]);

    if (result.length === 0) {
      return res.status(401).send({ msg: "Usuario o contraseña incorrecta" });
    }
    console.log(result);
    const user = result[0];
    user.clave = await encriptarClave(user.clave);

    const validPassword = await verificarClave(clave, user.clave);
    if (!validPassword) {
      return res.status(401).send({
        msg: "Usuario o contraseña incorrecta",
        validPassword: validPassword,
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombres,
        apellidos: user.apellidos,
        nivel: user.nivel,
      },
      jwtSecret,
      { expiresIn: "40000000000h" }
    );

    res.send({
      Nombre: user.nombres,
      Nivel: user.nivel,
      Token: token,
    });
  } catch (error) {
    console.error("Error en el proceso de login:", error);
    return res.status(500).send("Error en el servidor");
  }
});

// Ejemplo de ruta protegida
routerLogin.get("/protected", verifyToken, verifyLevelAdmin(), (req, res) => {
  console.log(req);
  res.send(`¡Hola ${req.usuario.nombre}, tienes acceso a esta ruta protegida!`);
});

routerLogin.get("/protected2", (req, res) => {
  res.send(`¡Hola ${req}, tienes acceso a esta ruta protegida!`);
});

export default routerLogin;
