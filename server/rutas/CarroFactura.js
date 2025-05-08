import express from "express";
import { db } from "../config.js";
import Joi from "joi";
const routerCarritoFactura = express.Router();
import {
  verifyLevelAdmin,
  verifyLevelMedium,
  verifyLevelLow,
  verifyToken,
} from "./VerificarNivel.js";
import Decimal from "decimal.js";
import {
  VerificarStockCarrito,
  AgregarCarrito,
  BuscarCarritoUsuarioProducto,
  BuscarCarritoUsuarioProductoID,
} from "./FuncionesFactura.js";

//router.post("/adminEndpoint", validarToken, autorizarRoles("administrador"), async (req, res)

routerCarritoFactura.post(
  "/RegistrarCarrito",
  verifyToken,
  verifyLevelLow(),
  async (req, res) => {
    // Definir esquema de validación

    const { producto, cantidad, cliente } = req.body;
    const usuario = req.usuario.id;
    let connection;

    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // Verificar estado del producto, cliente y usuario
      const [productRows] = await connection.execute(
        "SELECT estado, version FROM producto WHERE id = ?",
        [producto]
      );
      if (productRows.length === 0 || !productRows[0].estado) {
        return res.send({
          res: false,
          msg: "Producto no encontrado o inactivo",
        });
      }

      const [clienteRows] = await connection.execute(
        "SELECT estado FROM cliente WHERE id = ?",
        [cliente]
      );
      if (clienteRows.length === 0 || !clienteRows[0].estado) {
        return res.send({
          res: false,
          msg: "Cliente no encontrado o inactivo",
        });
      }

      const [usuarioRows] = await connection.execute(
        "SELECT estado FROM usuario WHERE id = ?",
        [usuario]
      );
      if (usuarioRows.length === 0 || !usuarioRows[0].estado) {
        return res.send({
          res: false,
          msg: "Usuario no encontrado o inactivo",
        });
      }
      // Verificar stock del producto
      console.log("Verificando stock del producto");
      const EnCarrito = await BuscarCarritoUsuarioProducto(usuario, producto);
      console.log({ EnCarrito });

      if (EnCarrito.res) {
        return res.send({
          res: false,
          msg: "El producto ya está en el carrito",
        });
      }
      const { msg, resp, disponible } = await VerificarStockCarrito({
        producto,
        cantidad,
      });
      if (!resp) {
        console.log(msg);
        return res.send({ msg, res: resp });
      }
      console.log({ msg: "Se puede agregar al carrito", disponible });

      // Registrar en carritofactura
      const Agregar = AgregarCarrito(usuario, producto, cantidad, cliente);

      if (Agregar === false) {
        return res.send({
          res: false,
          msg: "No se pudo agregar al carrito",
        });
      }

      res.send({ res: true, msg: "Registro exitoso" });
      console.log({ res: true, msg: "Registro exitoso" });
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);

      return res.status(500).send({
        res: false,
        msg: "No se pudo registrar. Por favor, inténtelo más tarde.",
      });
    }
  }
);

routerCarritoFactura.get(
  "/DatosCarrito",
  verifyToken,
  verifyLevelLow(),
  async (req, res) => {
    const { id } = req.usuario;

    try {
      const [usuarioRows] = await db.execute(
        "SELECT estado FROM usuario WHERE id = ?",
        [id]
      );
      if (usuarioRows.length === 0 || !usuarioRows[0].estado) {
        console.log("Usuario no encontrado o inactivo");
        return res.status(404).send({
          res: false,
          msg: "Usuario no encontrado o inactivo",
        });
      }
      const EnCarrito = await BuscarCarritoUsuarioProducto(usuario, id);
      if (!EnCarrito.resp) {
        return res.send({
          res: false,
          msg: "El producto no está en el carrito",
        });
      }

      console.log({ msg: "Se puede agregar al carrito", disponible });
      const querysql = "SELECT * FROM carritofactura  WHERE usuario =?";
      const [result] = await db.execute(querysql, [id]);
      //este es un condicional corto
      const msg2 =
        result.length > 0
          ? "se encontraron registros"
          : "no se ha realizado ningún registro";

      console.log({ res: true, data: result, msg: msg2 });

      return res.status(500).send({ res: true, data: result, msg: msg2 });
    } catch (error) {
      console.error("se encontraron registros", error.stack);
      res.status(500).send({ res: false, msg: "Error al mostrar datos" });
    }
  }
);

routerCarritoFactura.put(
  "/ActualizarCarrito",
  verifyToken,
  verifyLevelLow(),
  async (req, res) => {
    const { id, cantidad } = req.body;
    const usuario = req.usuario.id;
    // Verificar si las variables no están vacías
    const fieldsToUpdate = [];
    const valuesToUpdate = [];

    const [usuarioRows] = await db.execute(
      "SELECT estado FROM usuario WHERE id = ?",
      [usuario]
    );
    if (usuarioRows.length === 0 || !usuarioRows[0].estado) {
      return res.send({
        res: false,
        msg: "Usuario no encontrado o inactivo",
      });
    }
    console.log("Verificando stock del producto");
    const EnCarrito = await BuscarCarritoUsuarioProductoID(usuario, id);
    if (!EnCarrito.res) {
      return res.send({
        res: false,
        msg: "El producto no está en el carrito",
      });
    }
    const { msg, resp, disponible } = await VerificarStockCarrito({
      producto: EnCarrito.producto,
      cantidad: EnCarrito.cantidad,
    });
    if (!resp) {
      console.log(msg);
      return res.send({ msg, res: resp });
    }

    if (cantidad) {
      fieldsToUpdate.push("cantidadCarrito = ?");
      valuesToUpdate.push(cantidad);
    }

    valuesToUpdate.push(id); // Añadir ID al final

    try {
      if (fieldsToUpdate.length > 0) {
        const querysql = `UPDATE carritofactura SET cantidadCarrito = ? WHERE id = ?`;
        const [result] = await db.execute(querysql, valuesToUpdate);
        if (result.affectedRows === 0) {
          return res.status(404).send({
            res: false,
            msg: "No se encontró el registro para actualizar",
          });
        }
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

routerCarritoFactura.delete(
  "/EliminarProductoCarrito/:id",
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
      const querysql = "DELETE FROM carritofactura WHERE id = ?";
      await db.execute(querysql, [id]);

      res.send({ res: true, msg: "Producto removido exitosamente" });
    } catch (error) {
      console.error(
        "Error al Producto removido en la base de datos:",
        error.stack
      );
      res
        .status(500)
        .send({ res: false, msg: "Ha ocurrido un error inesperado" });
    }
  }
);
routerCarritoFactura.delete("/VaciarCarritoUsuario/:id", async (req, res) => {
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
    const querysql = "DELETE FROM carritofactura WHERE usuario = ?";
    await db.execute(querysql, [id]);

    res.send({ res: true, msg: "Se ha vaciado el carrito" });
  } catch (error) {
    console.error(
      "Error al Vaciar el carrito en la base de datos:",
      error.stack
    );
    res
      .status(500)
      .send({ res: false, msg: "Ha ocurrido un error inesperado" });
  }
});
export default routerCarritoFactura;
