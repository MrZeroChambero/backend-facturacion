import express from "express";
import { db } from "../config.js";
const routerProductos = express.Router();
import {
  verifyLevelAdmin,
  verifyLevelMedium,
  verifyLevelLow,
  verifyToken,
} from "./VerificarNivel.js";
import {
  validateProductCreate,
  validateProductUpdate,
} from "./ValidarProducto.js";
import {
  validateDataEstado,
  validateBusqueda,
  validateDelete,
} from "./ValidarDeleteEstado.js";

routerProductos.post(
  "/Registrar",
  verifyToken,
  verifyLevelAdmin(),
  validateProductCreate,
  async (req, res) => {
    //Extraigo las propiedades del cuerpo de la solicitud directamente al desestructurarlas
    //validamos el json por ensima
    console.log("Se ha recibido una solicitud de registro de producto");
    console.log(req.usuario);
    const {
      cod,
      nombre,
      descripcion,
      precio,
      tipo,
      medicion,
      stockmin,
      stockmax,
    } = req.body;
    const estado = true;
    const version = 0;
    try {
      const querysql =
        "INSERT INTO producto (cod, nombre, descripcion, precio, tipo, medicion, stockmin, stockmax, version, estado) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const [result] = await db.execute(querysql, [
        cod,
        nombre,
        descripcion,
        precio,
        tipo,
        medicion,
        stockmin,
        stockmax,
        version,
        estado,
      ]);
      res.send({ res: true, msg: "Registro exitoso" });
      // Obtener el ID autoincremental const productoId = result.
      console.log({ res: true, msg: "Registro exitoso" });
      const productoId = result.insertId;
      console.log(productoId);
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);
      res.status(500).send({ res: false, msg: "Error al registrar" });
    }
  }
);
routerProductos.get(
  "/Datos",
  verifyToken,
  verifyLevelLow(),
  async (req, res) => {
    console.log("Se ha recibido una solicitud de datos de producto");
    try {
      const querysql = "SELECT * FROM producto ORDER BY id";
      const [result] = await db.execute(querysql);
      //este es un condicional corto
      const msg2 =
        result.length > 0
          ? "se encontraron registros"
          : "no se ha realizado ningún registro";
      console.log("se encontraron registros");
      console.log({ res: true, data: result, msg: msg2 });

      res.status(500).send({ res: true, data: result, msg: msg2 });
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);
      res.status(500).send({ res: false, msg: "Error al mostrar datos" });
    }
  }
);
routerProductos.get(
  "/Datos/buscador/:query",
  verifyToken,
  verifyLevelLow(),
  async (req, res) => {
    console.log("Se ha recibido una solicitud de datos de producto");
    try {
      const querysql = "SELECT * FROM producto ORDER BY id";
      const [result] = await db.execute(querysql);
      //este es un condicional corto
      const msg2 =
        result.length > 0
          ? "se encontraron registros"
          : "no se ha realizado ningún registro";
      console.log("se encontraron registros");
      console.log({ res: true, data: result, msg: msg2 });

      res.status(500).send({ res: true, data: result, msg: msg2 });
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);
      res.status(500).send({ res: false, msg: "Error al mostrar datos" });
    }
  }
);
routerProductos.put(
  "/Actualizar",
  verifyToken,
  verifyLevelAdmin(),
  validateProductUpdate,
  async (req, res) => {
    console.log("Se ha recibido una solicitud de actualización de producto");
    const {
      id,
      cod,
      nombre,
      descripcion,
      precio,
      tipo,
      medicion,
      stockmin,
      stockmax,
    } = req.body;

    const fieldsToUpdate = [];
    const valuesToUpdate = [];

    if (cod) {
      fieldsToUpdate.push("cod = ?");
      valuesToUpdate.push(cod);
    }
    if (nombre) {
      fieldsToUpdate.push("nombre = ?");
      valuesToUpdate.push(nombre);
    }
    if (descripcion) {
      fieldsToUpdate.push("descripcion = ?");
      valuesToUpdate.push(descripcion);
    }
    if (precio) {
      fieldsToUpdate.push("precio = ?");
      valuesToUpdate.push(precio);
    }
    if (tipo) {
      fieldsToUpdate.push("tipo = ?");
      valuesToUpdate.push(tipo);
    }
    if (medicion) {
      fieldsToUpdate.push("medicion = ?");
      valuesToUpdate.push(medicion);
    }
    if (stockmin) {
      fieldsToUpdate.push("stockmin = ?");
      valuesToUpdate.push(stockmin);
    }
    if (stockmax) {
      fieldsToUpdate.push("stockmax = ?");
      valuesToUpdate.push(stockmax);
    }

    let attempt = 0;
    let updated = false;

    while (attempt < 5 && !updated) {
      let connection;
      try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Obtener la versión actual y realizar la primera consulta
        const [rows] = await connection.execute(
          "SELECT version,stockmax FROM producto WHERE id = ?",
          [id]
        );
        if (rows.length === 0) {
          throw new Error("Producto no encontrado");
        }
        if (rows[0].stockmax < stockmin) {
          throw new Error("El stock minimo no puede ser mayor al stock maximo");
        }

        const currentVersion = rows[0].version;
        const newVersion = currentVersion + 1;

        fieldsToUpdate.push("version = ?");
        valuesToUpdate.push(newVersion);
        valuesToUpdate.push(id); // Añadir ID al final
        valuesToUpdate.push(currentVersion); // Añadir versión actual al final

        if (fieldsToUpdate.length > 0) {
          const querysql = `UPDATE producto SET ${fieldsToUpdate.join(
            ", "
          )} WHERE id = ? AND version = ?`;
          const [result] = await connection.execute(querysql, valuesToUpdate);

          if (result.affectedRows === 0) {
            attempt++;
            console.log(
              `Intento ${attempt} fallido: La versión del producto ha cambiado`
            );
            await connection.rollback();
            continue;
          }

          // Puedes agregar más consultas aquí si lo necesitas
          // await connection.execute(otraConsulta, otrosValores);

          await connection.commit();
          updated = true;
          console.log("Registro actualizado exitosamente");
          res.send({ res: true, msg: "Registro actualizado exitosamente" });
        } else {
          throw new Error("No se proporcionaron campos para actualizar");
        }
      } catch (error) {
        console.error("Error al actualizar en la base de datos:", error.stack);
        if (attempt === 4) {
          res.status(500).send({
            res: false,
            msg: "No se pudo actualizar. Por favor, inténtelo más tarde.",
          });
        }
      } finally {
        if (connection) connection.release();
      }
    }
  }
);
routerProductos.patch(
  "/Estado",
  verifyToken,
  verifyLevelAdmin(),
  validateDataEstado,
  async (req, res) => {
    const { id, estado } = req.body;
    console.log("Se ha recibido una solicitud de cambio de estado de producto");
    let msg =
      estado === true
        ? "Se ha activado un producto"
        : "Se ha desactivado un producto";

    try {
      const querysql = "UPDATE producto SET estado=? WHERE producto.id = ?";

      const [result] = await db.execute(querysql, [estado, id]);
      console.log("Se ha cambiado el estado del producto");
      console.log(result);

      res.status(500).send({ res: true, msg });
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);
      res
        .status(500)
        .send({ res: false, msg: "Ha ocurrido un error inesperado" });
    }
  }
);
routerProductos.delete(
  "/Eliminar/:id",
  verifyToken,
  verifyLevelAdmin(),
  validateDelete,
  async (req, res) => {
    const { id } = req.params;
    console.log(req);
    console.log("Se ha recibido una solicitud de eliminación de producto");
    //falta validar si el producto esta en uso
    //agregar parametros para validar si se desea eliminar el producto
    try {
      const querysql = "DELETE FROM producto WHERE id = ?";
      await db.execute(querysql, [id]);
      console.log("producto eliminado exitosamente");
      res.send({ res: true, msg: "producto eliminado exitosamente" });
    } catch (error) {
      console.error(
        "Error al eliminar el producto en la base de datos:",
        error.stack
      );
      res
        .status(500)
        .send({ res: false, msg: "Ha ocurrido un error inesperado" });
    }
  }
);

export default routerProductos;
// 1)producto
// 2)materia prima
// 3)produto fabricable
// 4)materia fabricable
// 5)multi uso
// 6)herramientas
