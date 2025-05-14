import express from "express";
import { db } from "../config.js";
import Joi from "joi";
const routerClientes = express.Router();
import {
  validateClienteCreate,
  validateClienteUpdate,
} from "./ValidarCliente.js";
import {
  verifyLevelAdmin,
  verifyLevelLow,
  verifyLevelMedium,
  verifyToken,
} from "./VerificarNivel.js";
import {
  validateDataEstado,
  validateDelete,
  validateBusqueda,
} from "./ValidarDeleteEstado.js";

routerClientes.post(
  "/Registrar",
  verifyToken,
  verifyLevelAdmin(),
  validateClienteCreate,
  async (req, res) => {
    //Extraigo las propiedades del cuerpo de la solicitud directamente al desestructurarlas
    console.log("se ha solicitado registrar un cliente");
    const { nombre, cedulaRif, direccion, tlf, tipo, ultimoNumero } = req.body;
    const estado = true;
    //const facturaId = result.insertId;
    try {
      const verificarCedulaRif = `SELECT * FROM cliente WHERE cedulaRif = ?`;
      const [repetidos] = await db.execute(verificarCedulaRif, [cedulaRif]);
      if (repetidos.length > 0) {
        return res.status(400).send({
          res: false,
          msg: "Ya existe un cliente con la cédula/RIF proporcionada",
        });
      }

      const querysql =
        "INSERT INTO cliente (nombre, cedulaRif, direccion , tlf, tipo, ultimoNumero, estado) VALUES (?, ?, ?, ?, ?,?,?)";
      const [result] = await db.execute(querysql, [
        nombre,
        cedulaRif,
        direccion,
        tlf,
        tipo,
        ultimoNumero,
        estado,
      ]);

      res.send({ res: true, msg: "Registro exitoso" });
      // Obtener el ID autoincremental const clienteId = result.
      console.log({ res: true, msg: "Registro de cliente exitoso" });
      const clienteId = result.insertId;
      console.log(clienteId);
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);
      res.status(500).send({ res: false, msg: "Error al registrar" });
    }
  }
);
routerClientes.get(
  "/Datos",
  verifyToken,
  verifyLevelLow(),
  async (req, res) => {
    try {
      const querysql = "SELECT * FROM cliente ORDER BY id";
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
  }
);
routerClientes.get(
  "/Datos/Buscar/:query/:estado",
  verifyToken,
  verifyLevelLow(),
  validateBusqueda,
  async (req, res) => {
    const fieldsToSearch = [
      "nombre",
      "cedulaRif",
      "direccion",
      "tlf",
      "tipo",
      "ultimoNumero",
    ];
    const estado = req.params.estado;
    const termino = req.params.query;
    console.log("Se ha recibido una solicitud de datos de cliente");
    try {
      const querysql = `SELECT * FROM cliente WHERE (${fieldsToSearch
        .map((field) => `${field} LIKE ?`)
        .join(" OR ")}) AND estado = ?`;

      const likeTerm = `%${termino}%`;
      const valuesToSearch = fieldsToSearch.map(() => likeTerm);
      valuesToSearch.push(estado); // Agregar el valor de estado al final del array
      const [result] = await db.execute(querysql, valuesToSearch);
      //este es un condicional corto
      const msg2 =
        result.length > 0
          ? "se encontraron registros"
          : "no se ha realizado ningún registro";

      console.log({ res: true, data: result, msg: msg2 });

      res.status(200).send({ res: true, data: result, msg: msg2 });
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);
      res.status(500).send({ res: false, msg: "Error al mostrar datos" });
    }
  }
);
//const fieldsToSearch = [ "Nombre", "CedulaRif", "Direccion", "Tlf", "Tipo", "UltimoNumero", "Estado" ]; const query = ` SELECT * FROM Cliente WHERE ${fieldsToSearch.map(field => `${field} LIKE ?`).join(' OR ')} `; const likeTerm = `%${termino}%`; const valuesToSearch = fieldsToSearch.map(() =>
routerClientes.put(
  "/Actualizar",
  verifyToken,
  verifyLevelAdmin(),
  validateClienteUpdate,
  async (req, res) => {
    console.log("se ha solicitado actualizar un cliente");
    const { nombre, cedulaRif, direccion, tlf, tipo, ultimoNumero, id } =
      req.body;

    // Verificar si las variables no están vacías
    const fieldsToUpdate = [];
    const valuesToUpdate = [];

    if (nombre) {
      fieldsToUpdate.push("nombre = ?");
      valuesToUpdate.push(nombre);
    }
    if (cedulaRif) {
      fieldsToUpdate.push("cedulaRif = ?");
      valuesToUpdate.push(cedulaRif);
    }
    if (direccion) {
      fieldsToUpdate.push("direccion = ?");
      valuesToUpdate.push(direccion);
    }
    if (tlf) {
      fieldsToUpdate.push("tlf = ?");
      valuesToUpdate.push(tlf);
    }
    if (tipo) {
      fieldsToUpdate.push("tipo = ?");
      valuesToUpdate.push(tipo);
    }
    if (ultimoNumero) {
      fieldsToUpdate.push("ultimoNumero = ?");
      valuesToUpdate.push(ultimoNumero);
    }

    valuesToUpdate.push(id); // Añadir ID al final

    try {
      if (fieldsToUpdate.length > 0) {
        const querysql = `UPDATE cliente SET ${fieldsToUpdate.join(
          ", "
        )} WHERE cliente.id = ?`;
        await db.execute(querysql, valuesToUpdate);
        console.log("Registro de cliente actualizado exitosamente");
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
  }
);

routerClientes.patch(
  "/Estado",
  verifyToken,
  verifyLevelAdmin(),
  validateDataEstado,
  async (req, res) => {
    const { id, estado } = req.body;
    let msg =
      estado === true
        ? "Se ha activado un cliente"
        : "Se ha desactivado un cliente";

    try {
      const querysql = "UPDATE cliente SET estado=? WHERE cliente.id = ?";
      // const querysqlWithValues = `UPDATE cliente SET estado=${estado} WHERE cliente.id = ${id}`;

      //  Imprimir la consulta completa con los valores
      // console.log("Consulta SQL:", querysqlWithValues);

      const [result] = await db.execute(querysql, [estado, id]);

      res.status(500).send({ res: true, msg });
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);
      res
        .status(500)
        .send({ res: false, msg: "Ha ocurrido un error inesperado" });
    }
  }
);
routerClientes.delete(
  "/Eliminar/:id",
  verifyToken,
  verifyLevelAdmin(),
  validateDelete,
  async (req, res) => {
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
      const querysql = "DELETE FROM cliente WHERE id = ?";
      await db.execute(querysql, [id]);

      res.send({ res: true, msg: "Cliente eliminado exitosamente" });
    } catch (error) {
      console.error(
        "Error al eliminar el cliente en la base de datos:",
        error.stack
      );
      res
        .status(500)
        .send({ res: false, msg: "Ha ocurrido un error inesperado" });
    }
  }
);
export default routerClientes;
