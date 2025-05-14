import express from "express";
import Decimal from "decimal.js";
import { db } from "../config.js";
import {
  RevisarCarritoF,
  clientesDistintos,
  VerificarStock,
  transformarYConsolidarDatos,
  DetallesFactura,
  RegistrarFormasDePago,
  RestarStock,
  EliminarFactura,
  obtenerFechaYHoraActual,
} from "./FuncionesFactura.js";
import {
  CalcularTotalSinIva,
  CalcularTotalConIva,
  CalcularDineroRecibido,
  calcularCantidadProducto,
} from "./FuncionesCalculo.js";
import {
  verifyLevelAdmin,
  verifyLevelMedium,
  verifyLevelLow,
  verifyToken,
} from "./VerificarNivel.js";

const routerFactura = express.Router();

routerFactura.post(
  "/Crear",
  verifyToken,
  verifyLevelAdmin(),
  async (req, res) => {
    console.log("Recibiendo datos para crear compra:", {
      usuario: req.usuario,
      body: req.body,
    });

    const usuario = req.usuario.id;
    let sobrante;
    try {
      //? Se reciben y validan los datos de entrada
      const { forma, referencia, dinero: dineroInput } = req.body;
      const dinero = Array.isArray(dineroInput)
        ? dineroInput.map((d) => new Decimal(parseFloat(d)))
        : [new Decimal(parseFloat(dineroInput))];

      if (
        forma.length !== referencia.length ||
        referencia.length !== dinero.length
      ) {
        return res.send({
          msg: "Las formas de pago, referencias y montos de dinero deben coincidir en cantidad.",
          res: false,
        });
      }

      const [fecha, hora] = obtenerFechaYHoraActual();

      //? Validación de carrito y stock
      const datos = await RevisarCarrito(usuario);
      console.log("Datos del carrito:", datos);
      // if (!VerificarStock(datos)) {
      //   return res.send(
      //     "Se está solicitando más productos de los que se tienen."
      //   );
      // }
      console.log("stock", datos);
      const verificarStokl = await VerificarStock(datos);
      console.log(verificarStokl);

      return res.send(VerificarStock(datos));
      console.log("Validando montos de pago...");
      const { sobrante } = VerificarMontos(datos);

      //? Inserción de factura en la base de datos
      const cliente = datos[0]?.clienteCarrito;
      if (!cliente) {
        return res.status(400).send({
          msg: "No se pudo determinar el cliente de la factura.",
          res: false,
        });
      }

      const FacturaID = await CrearFactura(cliente, usuario, fecha, hora);
      if (FacturaID === false) {
        return res.send({
          res: false,
          msg: "Error al crear la factura",
        });
      }
      //? Procesamiento de detalles de factura
      const transformDatos = transformarYConsolidarDatos(datos);
      if (!(await DetallesFactura(FacturaID, transformDatos))) {
        throw new Error("Error al crear los detalles de la factura.");
      }

      //? Registro de formas de pago
      const datosFormasDePago = forma.map((f, index) => [
        f,
        dinero[index],
        referencia[index],
      ]);
      if (!(await RegistrarFormasDePago(FacturaID, datosFormasDePago))) {
        throw new Error("Error al registrar las formas de pago.");
      }

      //? Reducción de stock
      if (!(await RestarStock(transformDatos))) {
        throw new Error("Error al restar el stock.");
      }

      res.send({ res: true, msg: "Registro exitoso", sobrante });
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);

      if (FacturaID) {
        await EliminarFactura(FacturaID);
      }

      if (!res.headersSent) {
        res
          .status(500)
          .send({ res: false, msg: error.message || "Error al registrar." });
      }
    }
  }
);

routerFactura.get(
  "/Pagos",
  verifyToken,
  verifyLevelAdmin(),
  async (req, res) => {
    try {
      const estado = true;
      const querysql = "SELECT * FROM formaspago WHERE estado = ?";

      const [result] = await db.execute(querysql, [estado]);
      if (result.length < 0) {
        res
          .status(500)
          .send({ res: true, msg: "no se encontraron resultados" });
      }
      res.status(200).send({ res: true, msg: result });
    } catch (error) {
      console.error("Error al verificar las formas de pago:", error.stack);
      res.status(500).send({
        res: false,
        msg: "Ha ocurrido un error inesperado al verificar las formas de pago",
      });
    }
  }
);
routerFactura.delete(
  "/Eliminar/:id",
  verifyToken,
  verifyLevelAdmin(),
  async (req, res) => {
    const { id } = req.params;
    try {
      const querysql = "DELETE FROM factura WHERE id = ?";
      await db.execute(querysql, [id]);

      res.send({ res: true, msg: "Se ha eliminado la factura" });
    } catch (error) {
      console.error(
        "Error al eliminar factura en la base de datos:",
        error.stack
      );
      res
        .status(500)
        .send({ res: false, msg: "Ha ocurrido un error inesperado" });
    }
  }
);

routerFactura.patch(
  "/Estado",
  verifyToken,
  verifyLevelAdmin(),
  async (req, res) => {
    const { id, estado } = req.body;
    let msg =
      estado === true
        ? "Se ha activado un factura"
        : "Se ha desactivado un factura";

    try {
      const querysql = "UPDATE factura SET estado=? WHERE factura.id = ?";

      const [result] = await db.execute(querysql, [estado, id]);

      res.status(200).send({ res: true, msg });
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);
      res
        .status(500)
        .send({ res: false, msg: "Ha ocurrido un error inesperado" });
    }
  }
);

export default routerFactura;
