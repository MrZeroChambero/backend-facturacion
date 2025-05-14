import { db } from "../config.js";
import express from "express";
const routerCompra = express.Router();
import { Decimal } from "decimal.js";
import {
  verifyLevelAdmin,
  verifyLevelMedium,
  verifyLevelLow,
  verifyToken,
} from "./VerificarNivel.js";
import {
  CalcularTotalSinIva,
  CalcularTotalConIva,
  CalcularDineroRecibido,
  calcularCantidadProducto,
} from "./FuncionesCalculo.js";
import {
  ProveedoresDistintos,
  RevisarCarrito,
  VerificarStock,
  VerificarMontos,
  DetallesCompra,
  CrearPedido,
  CrearCompra,
  ConsolidarDatosPedidos,
  obtenerFechaYHoraActual,
  RegistrarFormasDePago,
  transformarYConsolidarDatos,
  EliminarCompra,
  LimpiarCarritoCompra,
} from "./FuncionesCompra.js";

// Aumentar el límite de listeners para evitar advertencias
//import { EventEmitter } from "events";
//EventEmitter.defaultMaxListeners = 20; // Ajusta según sea necesario

routerCompra.post(
  "/Crear",
  verifyToken,
  verifyLevelAdmin(),
  async (req, res) => {
    console.log("Recibiendo datos para crear compra:", {
      usuario: req.usuario,
      body: req.body,
    });

    let CompraID = 0;
    const usuario = req.usuario.id;

    try {
      // Extraer y validar datos del cuerpo de la solicitud
      const {
        forma,
        referencia,
        dinero: dineroInput,
        fechaRecepcion: fechaRecepcionInput,
      } = req.body;
      const fechaRecepcion = new Date(fechaRecepcionInput)
        .toISOString()
        .slice(0, 10);

      if (!Array.isArray(forma) || !Array.isArray(referencia) || !dineroInput) {
        return res.status(400).send({
          msg: "Datos de pago inválidos. Verifica las formas de pago, referencias y montos.",
          res: false,
        });
      }

      const dinero = Array.isArray(dineroInput)
        ? dineroInput.map((d) => new Decimal(parseFloat(d)))
        : [new Decimal(parseFloat(dineroInput))];

      if (
        forma.length !== referencia.length ||
        referencia.length !== dinero.length
      ) {
        return res.status(400).send({
          msg: "Las formas de pago, referencias y montos deben tener la misma longitud.",
          res: false,
        });
      }

      const [fecha, hora] = obtenerFechaYHoraActual();
      const datos = await RevisarCarrito(usuario);

      if (!datos || datos.length === 0) {
        return res.status(400).send({
          msg: "El carrito de compras está vacío.",
          res: false,
        });
      }
      // el signo ? ayuda a acceder a losdatos del arry si existe, si no existe no se ejecuta el resto de la linea
      // evita errores de undefined
      const proveedor = datos[0]?.proveedorCarrito;
      if (!proveedor) {
        return res.status(400).send({
          msg: "No se pudo determinar el proveedor de la compra.",
          res: false,
        });
      }

      console.log("Validando montos de pago...");
      const { sobrante } = VerificarMontos(datos);

      console.log("Creando la compra...");
      CompraID = await CrearCompra(
        usuario,
        proveedor,
        fecha,
        fechaRecepcion,
        hora
      );

      console.log("Procesando detalles de la compra...");
      const transformDatos = transformarYConsolidarDatos(datos);
      const registroCompleto = await DetallesCompra(CompraID, transformDatos);

      if (!registroCompleto) {
        await handleRollback(
          CompraID,
          "Error al crear los detalles de la compra."
        );
        return res.status(500).send({
          res: false,
          msg: "Error al registrar los detalles de la compra.",
        });
      }

      console.log("Creando pedidos...");
      const datosPedidos = ConsolidarDatosPedidos(datos);
      const pedidosCompletados = await CrearPedido(
        CompraID,
        datosPedidos,
        fechaRecepcion
      );

      if (!pedidosCompletados) {
        await handleRollback(
          CompraID,
          "Error al crear los pedidos de la compra."
        );
        return res.status(500).send({
          res: false,
          msg: "Error al registrar los pedidos de la compra.",
        });
      }

      console.log("Registrando formas de pago...");
      const datosFormasDePago = forma.map((f, index) => [
        f,
        dinero[index],
        referencia[index],
      ]);
      const formasDePagoRegistradas = await RegistrarFormasDePago(
        CompraID,
        datosFormasDePago
      );

      if (!formasDePagoRegistradas) {
        await handleRollback(
          CompraID,
          "Error al registrar las formas de pago."
        );
        return res
          .status(500)
          .send({ res: false, msg: "Error al registrar las formas de pago." });
      }

      console.log("Limpieza del carrito...");
      // await LimpiarCarritoCompra(usuario); // Descomentar si se implementa

      console.log("Proceso de compra completado exitosamente.");
      return res.send({ res: true, msg: "Registro exitoso", sobrante });
    } catch (error) {
      console.error("Error durante el proceso de compra:", error.stack);
      if (CompraID) await EliminarCompra(CompraID);
      if (!res.headersSent) {
        res
          .status(500)
          .send({ res: false, msg: "Error al registrar la compra." });
      }
    }
  }
);
//____________________________________________________________________________________________________________________________
routerCompra.get("/Pagos", async (req, res) => {
  try {
    const estado = true;
    const querysql = "SELECT * FROM formaspago WHERE estado = ?";

    const [result] = await db.execute(querysql, [estado]);
    if (result.length < 0) {
      res.status(500).send({ res: true, msg: "no se encontraron resultados" });
    }
    res.status(200).send({ res: true, msg: result });
  } catch (error) {
    console.error("Error al verificar las formas de pago:", error.stack);
    res.status(500).send({
      res: false,
      msg: "Ha ocurrido un error inesperado al verificar las formas de pago",
    });
  }
});
routerCompra.patch(
  "/Estado",
  verifyToken,
  verifyLevelAdmin(),
  async (req, res) => {
    console.log("Recibiendo datos para cambiar el estado de la compra:");
    console.log("datos usuario:", req.usuario, "datos enviados:", req.body);

    const { id, estado } = req.body;
    let msg =
      estado === true
        ? "Se ha activado un compra"
        : "Se ha desactivado un compra";

    try {
      const DesComSql = "UPDATE compra SET estado=? WHERE compra.id = ?";
      console.log({
        msg: "se cambia el estado de la compra",
        DesComSql,
        estado,
        id,
      });
      const [DesactivarCompra] = await db.execute(DesComSql, [estado, id]);

      if (DesactivarCompra.affectedRows === 0) {
        return res.send({
          res: false,
          msg: "No se pudo cambiar el estado de la compra",
        });
      }
      console.log("la orden de Compra ha cambiado de estado con exito");
      const DesEntraSql =
        "UPDATE entradaproductos set EstadoEntrada = ? WHERE CompraEntrada = ?";

      console.log({
        msg: "se cambia el estado de la entrada de productos",
        DesEntraSql,
        estado,
        id,
      });
      const [DesactivarEntrada] = await db.execute(DesEntraSql, [estado, id]);
      if (DesactivarEntrada.affectedRows === 0) {
        return res.send({
          res: false,
          msg: "No se pudo desactivar los productos en entrada",
        });
      }
      console.log("la entrada de productos han cambiado de estado con exito");

      res.status(500).send({ res: true, msg });
    } catch (error) {
      console.error("Error al registrar en la base de datos:", error.stack);
      res
        .status(500)
        .send({ res: false, msg: "Ha ocurrido un error inesperado" });
    }
  }
);

routerCompra.delete(
  "/Eliminar/:id",
  verifyToken,
  verifyLevelAdmin(),
  async (req, res) => {
    const { id } = req.params;
    try {
      const querysql = "DELETE FROM compra WHERE id = ?";
      await db.execute(querysql, [id]);

      res.send({ res: true, msg: "Se ha eliminado la compra" });
    } catch (error) {
      console.error(
        "Error al eliminar compra en la base de datos:",
        error.stack
      );
      res
        .status(500)
        .send({ res: false, msg: "Ha ocurrido un error inesperado" });
    }
  }
);

export default routerCompra;
// 1)carritofactura
// 2)materia prima
// 3)produto fabricable
// 4)materia fabricable
// 5)multi uso
// 6)herramientas
