import express from "express";
import { db } from "../config.js";
const routerCarritoCompra = express.Router();
import {
  verifyLevelAdmin,
  verifyLevelMedium,
  verifyLevelLow,
  verifyToken,
} from "./VerificarNivel.js";
import Decimal from "decimal.js";
import Joi from "joi";

//router.post("/adminEndpoint", validarToken, autorizarRoles("administrador"), async (req, res)

//agregar al carrito produtos para comprar
routerCarritoCompra.post(
  "/RegistrarCarrito",
  verifyToken,
  verifyLevelLow(),
  async (req, res) => {
    // Definir esquema de validación

    const { producto, cantidad, proveedor } = req.body;
    const usuario = req.usuario.id;
    let attempt = 0;
    let registered = false;
    let errores;
    let Verisones = 0;
    console.log("Se solicita agregar un producto al carrito de Compras");
    while (attempt < 5 && !registered) {
      let connection;

      try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Verificar estado del producto, Proveedor y usuario
        //productos
        console.log("Verificar estados");
        console.log("producto");
        const [productRows] = await connection.execute(
          "SELECT estado,version,stockmax,nombre,id FROM producto WHERE id = ?",
          [producto]
        );
        if (productRows.length === 0 || !productRows[0].estado) {
          console.log("Producto no encontrado o inactivo.");
          return res.send({
            res: false,
            msg: "Producto no encontrado o inactivo.",
          });
        }
        console.log("Datos:", productRows);
        console.log("Proveedor");

        //proveedor
        const [ProveedorRows] = await connection.execute(
          "SELECT estado,nombre FROM proveedor WHERE id = ?",
          [proveedor]
        );
        if (ProveedorRows.length === 0 || !ProveedorRows[0].estado) {
          console.log("Proveedor no encontrado o inactivo.");
          return res.send({
            res: false,
            msg: "Proveedor no encontrado o inactivo.",
          });
        }
        console.log("Datos:", ProveedorRows);

        //verificar la lista de productos de los proveedores

        console.log("verificar la lista de productos de los proveedores");

        const [ListaProductos] = await connection.execute(
          "SELECT * FROM proveedorproducto WHERE proveedor = ? and producto = ?",
          [proveedor, producto]
        );
        if (ListaProductos.length === 0) {
          return res.send({
            res: false,
            msg: `El Proveedor: ${ProveedorRows[0].nombre} no ofrece:${productRows[0].nombre} para su comprar, se debe agregar a su lista`,
          });
        }
        console.log("Datos:", ListaProductos);

        //usuario

        console.log("usurio");
        const [usuarioRows] = await connection.execute(
          "SELECT estado FROM usuario WHERE id = ?",
          [usuario]
        );
        if (usuarioRows.length === 0 || !usuarioRows[0].estado) {
          console.log("Usuario no encontrado o inactivo");
          return res.send({
            res: false,
            msg: "Usuario no encontrado o inactivo",
          });
        }

        console.log("Datos:", usuarioRows);

        const currentVersion = productRows[0].version;
        //cantidad de prodcutos en inventario
        // calcula la cantidad de producto que hay en inventario esto es mas para factura aqui solo se necesito obtener si va a superar el stock max

        // const cantidadFinal = await calcularCantidadProducto(
        //   connection,
        //   producto
        // );
        // console.log(
        //   `La cantidad final de productos es: ${cantidadFinal.toString()}`
        // );
        // // SUMA TODOS LOS PRODUCTOS IGUALES EN EL CARRITO
        // const [carritoRows] = await connection.execute(
        //   "SELECT SUM(cantidadCarrito) as totalCarrito FROM carritocompra WHERE productoCarrito = ?",
        //   [producto]
        // );
        // const totalCarrito = new Decimal(carritoRows[0].totalCarrito || 0);

        // // Verificar que la cantidad sea suficiente
        // const totalRequired = new Decimal(cantidad).plus(totalCarrito);
        // if (currentCantidad.minus(totalRequired).isNegative()) {
        //   return res.send({
        //     res: false,
        //     msg: "Cantidad insuficiente en el inventario.",
        //   });
        // }

        // Actualizar cantidad y versión del producto

        console.log("Actualizacion de version del producto:");
        const newVersion = currentVersion + 1;
        const updateProductQuery =
          "UPDATE producto SET  version = ? WHERE id = ? AND version = ?";
        const [updateResult] = await connection.execute(updateProductQuery, [
          newVersion,
          producto,
          currentVersion,
        ]);

        if (updateResult.affectedRows === 0) {
          Verisones++;

          console.log(
            `Intento ${Verisones} fallido: La versión del producto ha cambiado`
          );
          await connection.rollback();
          continue;
        }
        console.log(
          `Producto:${productRows[0].nombre} version:${currentVersion}`
        );

        // verificar si el carrito ya tiene ese producto
        console.log("verificar si el carrito ya tiene ese producto");
        const CarroCompra =
          "SELECT * FROM carritocompra WHERE productoCarrito = ? AND proveedorCarrito =? AND usuarioCarrito = ?";
        const [verificarCarrito] = await connection.execute(CarroCompra, [
          producto,
          proveedor,
          usuario,
        ]);
        if (verificarCarrito.length > 0) {
          console.log(
            "Actualizar  el producto del carrito",
            verificarCarrito[0].id
          );
          const sqlActualizar =
            "UPDATE carritocompra SET cantidadCarrito = ? WHERE carritocompra.id = ?";

          const [ActualizarCarro] = await connection.execute(sqlActualizar, [
            cantidad,
            verificarCarrito[0].id,
          ]);
          console.log("------------------------------");
          if (ActualizarCarro.affectedRows < 0) {
            console.log("No se pudo actualizar el producto en el carrito");
            return res.send({
              res: false,
              msg: "No se pudo actualizar el producto en el carrito",
            });
          }
          console.log("Producto actualizado en el carrito");
          return res.send({
            res: true,
            msg: "Producto Actualizado",
          });
        }
        // Registrar en carrito de compras
        console.log(`Registrar de carrito de compras`);
        const insertCarritoQuery =
          "INSERT INTO carritocompra (usuarioCarrito, productoCarrito, cantidadCarrito, proveedorCarrito) VALUES (?, ?, ?, ?)";
        await connection.execute(insertCarritoQuery, [
          usuario,
          producto,
          cantidad,
          proveedor,
        ]);

        await connection.commit();
        registered = true;
        console.log({ res: true, msg: "Registro exitoso" });
        return res.send({ res: true, msg: "Registro exitoso" });
      } catch (error) {
        attempt++;
        console.log("attempt:");
        console.log(attempt);
        console.error("Error al registrar en la base de datos:", error.stack);
        if (Verisones == 0 || attempt > 4) {
          return res.status(500).send({
            res: false,
            msg: "No se pudo registrar, intente mas tarde.",
          });
        }
      } finally {
        if (connection) connection.release();
      }
    }
    return res.status(400).send("eerror");
  }
);

//routerCarritoCompra.get("/DatosCarrito/:id", async (req, res) => {

routerCarritoCompra.get(
  "/DatosCarrito",
  verifyToken,
  verifyLevelLow(),
  async (req, res) => {
    console.log("Se solicita el carrito de Compras");
    console.log("Datos del usuario", req.usuario);
    //const id = req.usuario.id;

    const { id } = req.usuario;
    //console.log({ id: id });
    let errores = "";
    try {
      console.log("Verificar si el usuario existe o esta activo");
      const [usuarioRows] = await db.execute(
        "SELECT estado FROM usuario WHERE id = ?",
        [id]
      );
      if (usuarioRows.length === 0 || !usuarioRows[0].estado) {
        errores = "Usuario no encontrado o inactivo";
        console.log(errores);
        return res.send({ res: false, msg: errores });
      }

      const querysql = `
SELECT 
carro.*, prove.estado AS prove_estado, prove.nombre AS proveedor_nombre, 
prod.nombre AS prod_nombre, prod.estado AS prod_estado, 
usuario.estado AS usuarioEstado, prod.* 
FROM carritocompra AS carro 
INNER JOIN 
proveedor AS prove ON prove.id = carro.proveedorCarrito 
INNER JOIN 
producto AS prod ON prod.id = carro.productoCarrito 
INNER JOIN
 usuario ON usuario.id = carro.usuarioCarrito 
 WHERE 
 carro.usuarioCarrito = ? 
 AND prove.estado = true 
 AND prod.estado = true
`;
      console.log("hace una consulta a la base de datos");
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
      return res
        .status(500)
        .send({ res: false, msg: `Error al mostrar datos, ${errores}` });
    }
  }
);

routerCarritoCompra.put(
  "/ActualizarCarrito",
  verifyToken,
  verifyLevelLow(),
  async (req, res) => {
    const { id, cantidad } = req.body;
    const usuario = req.usuario.id;

    console.log("Se solicita actualizar el carrito de compras");

    try {
      // Verificar coherencia entre usuario y producto
      console.log("Verificar que el usuario y el producto son coherentes");
      const sqlConsulta = `SELECT * 
         FROM carritoCompra, producto 
         WHERE carritoCompra.id = ? 
           AND usuarioCarrito = ? 
           AND productoCarrito = producto.id`;

      const [Consulta] = await db.execute(sqlConsulta, [id, usuario]);

      if (Consulta.length < 1) {
        console.log("El producto no pertenece al usuario o no existe");
        return res.send({
          res: false,
          msg: "El producto no pertenece al usuario o no existe",
        });
      }

      if (!Consulta[0].estado) {
        console.log("El producto está inactivo o no existe");
        const sqlLimpiar = `DELETE FROM carritocompra 
           WHERE id = ?`;

        const [limpiar] = await db.execute(sqlLimpiar, [id]);

        if (limpiar.affectedRows > 0) {
          console.log("Se eliminó el producto inactivo del carrito");
          return res.send({
            res: false,
            msg: "El producto no pertenece al usuario o no existe",
          });
        }
      }

      // Actualizar producto en el carrito
      console.log("Actualizar el producto en el carrito");
      const sqlActualizar = `UPDATE carritocompra 
         SET cantidadCarrito = ? 
         WHERE carritocompra.id = ?`;

      const [ActualizarCarro] = await db.execute(sqlActualizar, [cantidad, id]);

      if (ActualizarCarro.affectedRows > 0) {
        return res.send({
          res: true,
          msg: "Producto actualizado exitosamente",
        });
      } else {
        return res.send({
          res: false,
          msg: "No se pudo actualizar el producto",
        });
      }
    } catch (error) {
      console.error("Error al actualizar en la base de datos:", error.stack);
      return res.status(500).send({
        res: false,
        msg: "Error al actualizar",
      });
    }
  }
);

routerCarritoCompra.delete(
  "/EliminarProductoCarrito/:id",
  verifyToken,
  verifyLevelLow(),
  async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario.id;

    console.log("Se solicita eliminar un producto del carrito de Compras");
    try {
      console.log(
        "Se realiza una solicitud para eliminar un producto del carrito"
      );
      const querysql =
        "DELETE FROM carritoCompra  WHERE id = ? AND usuarioCarrito =?";
      await db.execute(querysql, [id, usuario]);
      console.log({ res: true, msg: "Producto removido exitosamente" });
      return res.send({ res: true, msg: "Producto removido exitosamente" });
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
routerCarritoCompra.delete(
  "/VaciarCarritoUsuario",
  verifyToken,
  verifyLevelLow(),
  async (req, res) => {
    console.log("Se solicita eliminar el carrito de Compras");
    //const id = req.usuario.id;
    console.log(req.usuario);
    const { id } = req.usuario;
    console.log("Se solicita vaciar el carrito de Compras");

    try {
      const querysql = "DELETE FROM carritoCompra WHERE usuarioCarrito =?";
      const [Vaciar] = await db.execute(querysql, [id]);
      if (Vaciar.length > 0) {
        console.log("Error al eliminar el carrito de compras");
        return res.send({
          res: false,
          msg: "Error al eliminar el carrito de compras",
        });
      }
      console.log({ res: true, msg: "Se ha vaciado el carrito" });
      return res.send({ res: true, msg: "Se ha vaciado el carrito" });
    } catch (error) {
      console.error(
        "Error al Vaciar el carrito en la base de datos:",
        error.stack
      );
      res
        .status(500)
        .send({ res: false, msg: "Ha ocurrido un error inesperado" });
    }
  }
);

export default routerCarritoCompra;
