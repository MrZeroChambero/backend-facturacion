import { db } from "../config.js";
import express from "express";
const routerUsuario = express.Router();
import Joi from "joi";

routerUsuario.post("/Registrar", async (req, res) => {
  console.log(req.body);
  const { nombres, apellidos, cedula, tlf, nickname, clave, nivel } = req.body;
  const estado = true;

  try {
    const querysql =
      "INSERT INTO usuario (nombres, apellidos, cedula, tlf, nickname, clave, nivel, estado) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)";
    const [result] = await db.execute(querysql, [
      nombres,
      apellidos,
      cedula,
      tlf,
      nickname,
      clave,
      nivel,
      estado,
    ]);
    res.send({ res: true, msg: "Registro exitoso" });
    // Obtener el ID autoincremental const usuarioId = result.
    console.log({ res: true, msg: "Registro exitoso" });
    const usuarioId = result.insertId;
    console.log(usuarioId);
  } catch (error) {
    console.error("Error al registrar en la base de datos:", error.stack);
    res.status(500).send({ res: false, msg: "Error al registrar" });
  }
});
routerUsuario.get("/Datos", async (req, res) => {
  try {
    const querysql = "SELECT * FROM usuario ORDER BY id";
    const [result] = await db.execute(querysql);
    //este es un condicional corto
    const msg2 =
      result.length > 0
        ? "se encontraron registros"
        : "no se ha realizado ningún registro";

    console.log({ res: result, msg: msg2 });

    res.status(500).send({ res: result, msg: msg2 });
  } catch (error) {
    console.error("Error al registrar en la base de datos:", error.stack);
    res.status(500).send({ res: false, msg: "Error al mostrar datos" });
  }
});
routerUsuario.put("/Actualizar", async (req, res) => {
  const schema = Joi.object({
    id: Joi.number().required(),
    nombres: Joi.string().optional(),
    apellidos: Joi.string().optional(),
    cedula: Joi.number().optional(),
    tlf: Joi.number().optional(),
    nickname: Joi.string().optional(),
    clave: Joi.string().optional(),
    nivel: Joi.number().optional(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).send({ res: false, msg: error.details[0].message });
  }

  const { id, nombres, apellidos, cedula, tlf, nickname, clave, nivel } = value;

  // Verificar si las variables no están vacías
  const fieldsToUpdate = [];
  const valuesToUpdate = [];

  if (nombres) {
    fieldsToUpdate.push("nombres = ?");
    valuesToUpdate.push(nombres);
  }
  if (apellidos) {
    fieldsToUpdate.push("apellidos = ?");
    valuesToUpdate.push(apellidos);
  }
  if (cedula) {
    fieldsToUpdate.push("cedula = ?");
    valuesToUpdate.push(cedula);
  }
  if (tlf) {
    fieldsToUpdate.push("tlf = ?");
    valuesToUpdate.push(tlf);
  }
  if (nickname) {
    fieldsToUpdate.push("nickname = ?");
    valuesToUpdate.push(nickname);
  }
  if (clave) {
    fieldsToUpdate.push("clave = ?");
    valuesToUpdate.push(clave);
  }
  if (nivel) {
    fieldsToUpdate.push("nivel = ?");
    valuesToUpdate.push(nivel);
  }

  valuesToUpdate.push(id); // Añadir ID al final

  try {
    if (fieldsToUpdate.length > 0) {
      const querysql = `UPDATE usuario SET ${fieldsToUpdate.join(
        ", "
      )} WHERE usuario.id = ?`;
      await db.execute(querysql, valuesToUpdate);
      res.send({ res: true, msg: "Registro actualizado exitosamente" });
    } else {
      res.status(400).send({
        res: false,
        msg: "No se proporcionaron campos para actualizar",
      });
    }
  } catch (error) {
    console.error("Error al actualizar en la base de datos:", error.stack);
    res.status(500).send({ res: false, msg: "Error al actualizar" });
  }
});

routerUsuario.patch("/Estado", async (req, res) => {
  const { id, estado, token } = req.body;
  let msg =
    estado === true
      ? "Se ha activado un usuario"
      : "Se ha desactivado un usuario";

  try {
    const querysql = "UPDATE usuario SET estado=? WHERE usuario.id = ?";

    const [result] = await db.execute(querysql, [estado, id]);

    res.status(500).send({ res: true, msg });
  } catch (error) {
    console.error("Error al registrar en la base de datos:", error.stack);
    res
      .status(500)
      .send({ res: false, msg: "Ha ocurrido un error inesperado" });
  }
});
routerUsuario.delete("/Eliminar/:id", async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).send({
      res: false,
      msg: "Acceso denegado. Token no proporcionado o incorrecto.",
    });
  }

  const token = authHeader.split(" ")[1];

  // Aquí puedes agregar lógica para validar el token
  if (!validarToken(token)) {
    return res
      .status(403)
      .send({ res: false, msg: "Acceso denegado. Token inválido." });
  }

  try {
    const querysql = "DELETE FROM usuario WHERE id = ?";
    await db.execute(querysql, [id]);

    res.send({ res: true, msg: "usuario eliminado exitosamente" });
  } catch (error) {
    console.error(
      "Error al eliminar el usuario en la base de datos:",
      error.stack
    );
    res
      .status(500)
      .send({ res: false, msg: "Ha ocurrido un error inesperado" });
  }
});

// Función ficticia para validar el token
function validarToken(token) {
  // Lógica de validación del token
  return token === "tu_token_secreto";
}

export default routerUsuario;
