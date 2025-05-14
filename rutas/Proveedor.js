import express from "express";
import { db } from "../config.js";
const routerProveedor = express.Router();
import {
  validateProveedorCreate,
  validateProveedorUpdate,
} from "./ValidarProveedor.js";

import {
  verifyLevelAdmin,
  verifyLevelLow,
  verifyLevelMedium,
  verifyToken,
} from "./VerificarNivel.js";
import {
  validateDataEstado,
  validateBusqueda,
  validateDelete,
} from "./ValidarDeleteEstado.js";

routerProveedor.post(
  "/Registrar",
  verifyToken,
  verifyLevelAdmin(),
  validateProveedorCreate,
  async (req, res) => {
    //Extraigo las propiedades del cuerpo de la solicitud directamente al desestructurarlas
    console.log("se ha solicitado registrar un proveedor");
    console.log(req.body);
    const { rif, nombre, direccion, correo, tipoRif, ultimoNumero, tlf } =
      req.body;
    const estado = true;

    try {
      const querysql =
        "INSERT INTO proveedor (rif, nombre, direccion, correo, tipoRif, ultimoNumero, tlf, estado) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)";
      const [result] = await db.execute(querysql, [
        rif,
        nombre,
        direccion,
        correo,
        tipoRif,
        ultimoNumero,
        tlf,
        estado,
      ]);
      console.log("se ha registrado un proveedor");
      res.send({ res: true, msg: "Registro exitoso" });
      // Obtener el ID autoincremental const proveedorId = result.
      console.log({ res: true, msg: "Registro exitoso" });
      const proveedorId = result.insertId;
      console.log(proveedorId);
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);
      res.status(500).send({ res: false, msg: "Error al registrar" });
    }
  }
);
routerProveedor.get(
  "/Datos",
  verifyToken,
  verifyLevelLow(),
  async (req, res) => {
    console.log("se ha solicitado mostrar los datos de un proveedor");
    try {
      const querysql = "SELECT * FROM proveedor ORDER BY id";
      const [result] = await db.execute(querysql);
      //este es un condicional corto
      const msg2 =
        result.length > 0
          ? "se encontraron registros"
          : "no se ha realizado ningún registro";
      console.log("se ha solicitado mostrar los datos de un proveedor");
      console.log({ res: true, data: result, msg: msg2 });

      res.status(200).send({ res: true, data: result, msg: msg2 });
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);
      res.status(500).send({ res: false, msg: "Error al mostrar datos" });
    }
  }
);

routerProveedor.put(
  "/Actualizar",
  verifyToken,
  verifyLevelAdmin(),
  validateProveedorUpdate,
  async (req, res) => {
    console.log("se ha solicitado actualizar un proveedor");
    const { id, rif, nombre, direccion, correo, tipoRif, ultimoNumero, tlf } =
      req.body;

    // Verificar si las variables no están vacías
    const fieldsToUpdate = [];
    const valuesToUpdate = [];

    if (rif) {
      fieldsToUpdate.push("rif = ?");
      valuesToUpdate.push(rif);
    }
    if (nombre) {
      fieldsToUpdate.push("nombre = ?");
      valuesToUpdate.push(nombre);
    }
    if (direccion) {
      fieldsToUpdate.push("direccion = ?");
      valuesToUpdate.push(direccion);
    }
    if (correo) {
      fieldsToUpdate.push("correo = ?");
      valuesToUpdate.push(correo);
    }
    if (tipoRif) {
      fieldsToUpdate.push("tipoRif = ?");
      valuesToUpdate.push(tipoRif);
    }
    if (ultimoNumero) {
      fieldsToUpdate.push("ultimoNumero = ?");
      valuesToUpdate.push(ultimoNumero);
    }
    if (tlf) {
      fieldsToUpdate.push("tlf = ?");
      valuesToUpdate.push(tlf);
    }

    valuesToUpdate.push(id); // Añadir ID al final

    try {
      if (fieldsToUpdate.length > 0) {
        const querysql = `UPDATE proveedor SET ${fieldsToUpdate.join(
          ", "
        )} WHERE proveedor.id = ?`;
        await db.execute(querysql, valuesToUpdate);
        console.log("Registro actualizado exitosamente");
        res.send({ res: true, msg: "Registro actualizado exitosamente" });
      } else {
        console.log("No se proporcionaron campos para actualizar");
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

routerProveedor.patch(
  "/Estado",
  verifyToken,
  verifyLevelAdmin(),
  validateDataEstado,
  async (req, res) => {
    const { id, estado } = req.body;
    console.log("se ha solicitado cambiar el estado de un proveedor");
    let msg =
      estado === true
        ? "Se ha activado un proveedor"
        : "Se ha desactivado un proveedor";

    try {
      const querysql = "UPDATE proveedor SET estado=? WHERE proveedor.id = ?";

      const [result] = await db.execute(querysql, [estado, id]);
      console.log("El estado del proveedor ha sido cambiado exitosamente");
      res.status(500).send({ res: true, msg });
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);
      res
        .status(500)
        .send({ res: false, msg: "Ha ocurrido un error inesperado" });
    }
  }
);
routerProveedor.delete(
  "/Eliminar/:id",
  verifyToken,
  verifyLevelAdmin(),
  validateDelete,
  async (req, res) => {
    console.log("se ha solicitado eliminar un proveedor");
    const { id } = req.params;

    try {
      const querysql = "DELETE FROM proveedor WHERE id = ?";
      await db.execute(querysql, [id]);
      console.log("proveedor eliminado exitosamente");
      res.send({ res: true, msg: "proveedor eliminado exitosamente" });
    } catch (error) {
      console.error(
        "Error al eliminar el proveedor en la base de datos:",
        error.stack
      );
      res
        .status(500)
        .send({ res: false, msg: "Ha ocurrido un error inesperado" });
    }
  }
);

export default routerProveedor;
// 1)proveedor
// 2)materia prima
// 3)produto fabricable
// 4)materia fabricable
// 5)multi uso
// 6)herramientas
