import { db } from "../config.js";
import { Decimal } from "decimal.js";
import {
  CalcularTotalSinIva,
  CalcularTotalConIva,
  CalcularDineroRecibido,
  calcularCantidadProducto,
} from "./FuncionesCalculo.js";

export const obtenerFechaYHoraActual = () => {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  const segundos = String(fecha.getSeconds()).padStart(2, "0");

  const fechaActual = `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
  const horaActual = `${horas}:${minutos}:${segundos}`;
  console.log(fechaActual);
  console.log(horaActual);
  return [fechaActual, horaActual];
};

// Compras

// crear los pedidos de productos
//  la fecha lleva comillas simples porque es un string
export const CrearPedido = async (compra, datos, fechaRecepcion) => {
  console.log("Se registran los pedidos de productos");
  console.log("fechaRecepcion:", fechaRecepcion);
  console.log("datos:", datos);

  try {
    // Validar que 'datos' sea un array y no contenga elementos undefined
    console.log(
      "Se verifica que los datos sean un array y que no contengan undefined"
    );

    if (!Array.isArray(datos) || datos.some((d) => d.includes(undefined))) {
      console.log("Datos incompletos o incorrectos");
      return false;
    }

    // Asegurarse de que 'fechaRecepcion' tiene un valor válido y está en el formato adecuado
    if (!fechaRecepcion || isNaN(new Date(fechaRecepcion).getTime())) {
      console.log("FechaRecepcion no es válida");
      return false;
    }

    console.log(
      "Se crea un array de valores para la consulta SQL, de esta manera insertar los datos es más rápido"
    );

    // Construcción de los valores para la consulta SQL
    const values = datos
      .map(
        ([cantidad, producto]) =>
          `( ${cantidad}, ${producto}, ${compra}, '${fechaRecepcion}', ${true})`
      )
      .join(",");

    console.log(
      "Se inserta la lista de productos solicitados",
      "values:",
      values
    );

    // Consulta SQL
    const querysql = `
      INSERT INTO entradaproductos (CantidadEntrada, ProductoEntrada, CompraEntrada, FechaEntrada, EstadoEntrada) VALUES ${values}
    `;

    await db.execute(querysql); // Ejecución de la consulta
    return true;
  } catch (error) {
    // Manejo de errores
    console.error("Error al crear productos solicitados:", error);
    return false;
  }
};
export const CrearCompra = async (
  usuario,
  proveedor,
  fecha,
  fechaRecepcion,
  hora
) => {
  const estado = true;
  const iva = 16;
  const tipo = "Orden de Compra";
  const querysql = `
      INSERT INTO compra (tipo, usuario, proveedor, fechaCreacion,fechaRecepcion, hora, iva, estado)
      VALUES (?, ?, ?, ?, ?,?, ?, ?)
    `;

  const queryValues = [
    tipo,
    usuario,
    proveedor,
    fecha,
    fechaRecepcion,
    hora,
    iva,
    estado,
  ];
  console.log({ msg: "se crea la compra", queryValues });
  try {
    const [result] = await db.execute(querysql, queryValues);

    if (result.affectedRows === 0) {
      return res.send({
        res: false,
        msg: "No se pudo Crear la compra",
      });
    }
    console.log({ msg: "Resultado de la inserción de compra:", result });
    return result.insertId; // Retorna el ID de la compra creada
  } catch (error) {
    return res.send({
      res: false,
      msg: "Ocurrio un error al crear la compra",
      error: error.message,
    });
  }
};

// Funcion para crear detalles de compra
export const DetallesCompra = async (compra, datos) => {
  console.log("se registran los detalles de la compra");
  console.log("datos:", datos);
  try {
    console.log(
      "se  Verifica que los datos sean un array y que no contengan un valor indefinido"
    );

    if (!Array.isArray(datos) || datos.some((d) => d.includes(undefined))) {
      console.log("Datos incompletos o incorrectos");
      return false;
    }
    // esto se debe analizar mas a produndidad
    console.log(
      "se crean un array de valores para la consulta sql, de esta manera insertar los datos es mas rapido"
    );
    const values = datos
      .map(
        ([producto, cantidad, precioUnidad]) =>
          `(${compra}, ${producto}, ${cantidad}, ${precioUnidad})`
      )
      .join(",");

    console.log({
      msg: "se inserta los detalles de la compra en la base de datos,values:",
      values,
    });
    const querysql = `
      INSERT INTO detallescompra (compra, producto, cantidad, costoUnidad) VALUES ${values}
    `;

    await db.execute(querysql);
    return true;
  } catch (error) {
    // Manejo de errores
    console.error("Error al crear detalles compra:", error);
    return false;
  }
};
// Funcion para eliminar la compra
export const EliminarCompra = async (compra, res) => {
  try {
    const querysql = "DELETE FROM compra WHERE id = ?";
    await db.execute(querysql, [compra]);
    return true; // Retorna true si la ejecución del SQL fue correcta
  } catch (error) {
    console.error("Error al eliminar datos:", error.stack);
    return false; // Retorna false en caso de error
  }
};
export const handleRollback = async (compraId, mensajeError) => {
  const eliminacionExitosa = await EliminarCompra(compraId);
  res.send({
    res: false,
    msg: eliminacionExitosa
      ? mensajeError
      : `${mensajeError} y no se pudo eliminar los datos. El código de la compra es: ${compraId}`,
  });
};
export const handleRollbackStock = async (
  res,
  compraId,
  mensajeError,
  stock
) => {
  const eliminacionExitosa = await EliminarCompra(compraId);

  let msg = "";
  if (eliminacionExitosa == false) {
    msg += `hubo un error al elminar la compra cod:${compraId}`;
  } else {
    msg += `${mensajeError} y no se pudo eliminar los datos. El código de la compra es: ${compraId}`;
  }

  res.send({
    res: false,
    msg,
  });
};
// Funcion para eliminar el carrito de compra
export const LimpiarCarritoCompra = async (id) => {
  try {
    const querysql = "DELETE FROM carritocompra WHERE usuario = ?";
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
};
export const ProveedoresDistintos = (carritoCompra) => {
  // Usar un objeto para rastrear clientes únicos
  const uniqueClients = {};
  const filteredCarritoCompra = carritoCompra.filter((record) => {
    if (!uniqueProveedor[record.proveedor]) {
      uniqueProveedor[record.proveedor] = true;
      return true; // Mantener el registro
    }
    return false;
    // Filtrar el duplicado
  });
};
export const RevisarCarrito = async (user) => {
  console.log("se revisa el carrito de compra");
  try {
    const querysql = `
  SELECT cc.*, 
  Prove.nombre AS proveedorNombre, 
  prod.nombre AS productoNombre, 
  prod.precio AS precio, 
  u.id AS usuarioID, 
  u.estado AS usuarioEstado,
  Prove.estado AS ProveedorEstado
  FROM carritocompra cc 
  JOIN proveedor Prove ON cc.proveedorCarrito = Prove.id 
  JOIN producto prod ON cc.productoCarrito = prod.id 
  JOIN usuario u ON cc.usuarioCarrito = u.id 
  WHERE u.id=? and prod.estado=true`;

    const [result] = await db.execute(querysql, [user]);
    return result;
  } catch (error) {
    console.error("Error al consultar el Carrito:", error.stack);
    return false;
  }
};
export const RegistrarFormasDePago = async (compra, datos) => {
  console.log("datos", datos);
  try {
    const values = datos
      .map(
        ([forma, dinero, referencia]) =>
          `(${compra}, ${forma}, ${dinero}, ${referencia})`
      )
      .join(",");

    const querysql = `
      INSERT INTO pagocompra (compra, forma, cantidad, referencia) VALUES ${values}
    `;

    await db.execute(querysql);
    return true;
  } catch (error) {
    console.error("Error al registrar formas de pago:", error);
    return false;
  }
};
export const transformarYConsolidarDatos = (datos) => {
  const consolidado = {};

  datos.forEach(({ productoCarrito, cantidadCarrito, precio }) => {
    if (!consolidado[productoCarrito]) {
      consolidado[productoCarrito] = {
        cantidadCarrito: new Decimal(cantidadCarrito),
        precio,
      };
    } else {
      consolidado[productoCarrito].cantidadCarrito = consolidado[
        productoCarrito
      ].cantidadCarrito.plus(new Decimal(cantidadCarrito));
    }
  });

  return Object.entries(consolidado).map(
    ([productoCarrito, { cantidadCarrito, precio }]) => [
      parseInt(productoCarrito),
      cantidadCarrito.toNumber(),
      precio,
    ]
  );
};

export const ConsolidarDatosPedidos = (datos) => {
  const consolidado = {};
  datos.forEach(({ cantidadCarrito, productoCarrito }) => {
    if (!consolidado[productoCarrito]) {
      consolidado[productoCarrito] = {
        cantidadCarrito: new Decimal(cantidadCarrito),
      };
    } else {
      consolidado[productoCarrito].cantidadCarrito = consolidado[
        productoCarrito
      ].cantidadCarrito.plus(new Decimal(cantidadCarrito));
    }
  });

  // Corrección en el mapeo:
  return Object.entries(consolidado).map(
    ([productoCarrito, { cantidadCarrito }]) => [
      cantidadCarrito.toNumber(),
      parseInt(productoCarrito),
    ]
  );
};
export const ValidarReferencia = (valor, pago) => {};

export const VerificarStock = (datos) => {
  for (const { cantidad, cantidadCarrito } of datos) {
    const restante = new Decimal(cantidad).minus(cantidadCarrito);
    if (restante.isNegative() && restante !== undefined) {
      return false;
    }
  }
  return true;
};
export const VerificarMontos = (datos, dinero) => {
  try {
    const iva = 16;
    let sobrante = "";
    const PrecioTotal = CalcularTotalSinIva(datos);
    const PrecioTotalConIva = new Decimal(
      CalcularTotalConIva(PrecioTotal, iva)
    );
    console.log(
      "calculo el precio total con iva",
      PrecioTotalConIva.toString()
    );

    const DineroIngresado = new Decimal(CalcularDineroRecibido(dinero));

    console.log(
      "verifica que el dinero ingresado sea igual al precio total con iva",
      DineroIngresado.toString()
    );

    if (DineroIngresado.equals(PrecioTotalConIva)) {
      console.log("los montos son iguales");
      return { res: true, sobrante: "" };
    }
    console.log({ msg: "no son iguales", DineroIngresado });

    const Inconsistencia = PrecioTotalConIva.minus(DineroIngresado).times(-1);

    if (DineroIngresado.gt(PrecioTotalConIva)) {
      console.log({ msg: "se debe devolver dinero", Inconsistencia });

      sobrante = `Se deben devolver: ${Inconsistencia.toString()}.Bs`;
      return { res: true, sobrante };
    }

    if (DineroIngresado.lt(PrecioTotalConIva)) {
      console.log({ msg: "falta dinero:", Inconsistencia });

      return { res: false, msg: `Faltan : ${Inconsistencia.toString()}.Bs` };
    }
  } catch (error) {
    console.error("Error en VerificarMontos:", error.message);
    return { res: false, msg: "Ocurrió un error al verificar los montos" };
  }
};
