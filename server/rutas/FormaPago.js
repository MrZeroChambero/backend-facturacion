import { db } from "../config.js";
import express from "express";
const routerFormaPago = express.Router();

routerFormaPago.get("/Pagos", async (req, res) => {
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

export default routerFormaPago;
