import { db } from "../config.js";
import { Decimal } from "decimal.js";
import {
  CalcularTotalSinIva,
  CalcularTotalConIva,
  CalcularDineroRecibido,
  calcularCantidadProducto,
} from "./FuncionesCalculo.js";
export const AgregarCarrito = async (usuario, producto, cantidad, cliente) => {
  const querysql =
    "INSERT INTO carritofactura (usuario, productoCarrito, cantidadCarrito, clienteCarrito) VALUES (?, ?, ?, ?)";
  try {
    const [result] = await db.execute(querysql, [
      usuario,
      producto,
      cantidad,
      cliente,
    ]);
    if (result.affectedRows === 0) {
      console.error("No se pudo agregar al carrito.");
      return false;
    }
    return true; // La inserción fue exitosa
  } catch (error) {
    console.error("Error al agregar al carrito:", error.stack);
    return false;
  }
};
export const BuscarCarritoUsuarioProducto = async (usuario, producto) => {
  // Verificar si el usuario y el producto son válidos
  console.log({
    msg: "Verificar si el usuario y el producto son válidos",
    usuario,
    producto,
  });
  const querysql = `
  SELECT * FROM carritofactura WHERE carritofactura.usuario =? AND productoCarrito = ?
  `;

  try {
    const [result] = await db.execute(querysql, [usuario, producto]);
    console.log(result);
    if (result.length === 0) {
      console.error("No se encontró el carrito del usuario.");
      return { res: false, cantidad: 0, producto: 0 };
    }
    return {
      res: true,
      cantidad: result[0].cantidadCarrito,
      producto: result[0].id,
    }; // El carrito fue encontrado
  } catch (error) {
    console.error("Error al buscar el carrito del usuario:", error.stack);
    return { res: false, cantidad: 0, producto: 0 };
  }
};
export const BuscarCarritoUsuarioProductoID = async (usuario, producto) => {
  // Verificar si el usuario y el producto son válidos
  console.log({
    msg: "Verificar si el usuario y el producto son válidos",
    usuario,
    producto,
  });
  const querysql = `
  SELECT * FROM carritofactura WHERE carritofactura.usuario =? AND carritofactura.id = ?
  `;

  try {
    const [result] = await db.execute(querysql, [usuario, producto]);
    console.log(result);
    if (result.length === 0) {
      console.error("No se encontró el producto en el carrito.");
      return { resp: false, cantidad: 0, producto: 0 };
    }
    return {
      resp: true,
      cantidad: result[0].cantidadCarrito,
      producto: result[0].id,
    }; // El carrito fue encontrado
  } catch (error) {
    console.error("Error al buscar el carrito del usuario:", error.stack);
    return { resp: false, cantidad: 0, producto: 0 };
  }
};
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
export const RevisarCarritoF = async (user) => {
  try {
    const querysql = `
    SELECT 
    carritofactura.*,
    producto.id,producto.precio,
    producto.estado AS productoEstado,
    cliente.id,
    cliente.estado AS clienteEstado,
    usuario.id,
    usuario.estado AS usuarioEstado
FROM 
    carritofactura
JOIN 
    producto ON productoCarrito = producto.id
JOIN 
    cliente ON clienteCarrito = cliente.id
JOIN 
    usuario ON usuario.id = ? AND usuario.estado = true;
    `;
    const [result] = await db.execute(querysql, [user]);
    if (result.length === 0) {
      console.error("No se encontraron resultados en la consulta.");
      return [];
    }
    return result;
  } catch (error) {
    console.error("Error al consultar el Carrito:", error.stack);
    return [];
  }
};
export const RevisarCarritoProducto = async (producto) => {
  try {
    const querysql = `
      SELECT 
          carritofactura.*,
          producto.id, producto.precio,
          producto.estado AS productoEstado,
          cliente.id,
          cliente.estado AS clienteEstado,
          usuario.id,
          usuario.estado AS usuarioEstado
      FROM 
          carritofactura
      JOIN 
          producto ON productoCarrito = producto.id AND productoCarrito = ?
      JOIN 
          cliente ON clienteCarrito = cliente.id
      JOIN 
          usuario ON usuario.id = carritofactura.usuario AND usuario.estado = true
    `;
    const [result] = await db.execute(querysql, [producto]);
    if (result.length === 0) {
      console.error("No se encontraron resultados en la consulta.");
      return { data: [], sol: false }; // Forma válida
    }
    return { data: result, sol: true };
  } catch (error) {
    console.error("Error al consultar el Carrito:", error.stack);
    return { data: [], sol: false }; // Forma válida
  }
};
export const RevisarTodoCarritoF = async () => {
  try {
    const querysql = `
   SELECT 
    carritofactura.*,
    producto.id,producto.precio,
    producto.estado AS productoEstado,
    cliente.id,
    cliente.estado AS clienteEstado,
    usuario.id,
    usuario.estado AS usuarioEstado
FROM 
    carritofactura
JOIN 
    producto ON productoCarrito = producto.id
JOIN 
    cliente ON clienteCarrito = cliente.id
JOIN 
    usuario ON usuario.id = carritofactura.usuario AND usuario.estado = true;;
    `;
    const [result] = await db.execute(querysql);
    if (result.length === 0) {
      console.error("No se encontraron resultados en la consulta.");
      return [];
    }
    return result;
  } catch (error) {
    console.error("Error al consultar el Carrito:", error.stack);
    return [];
  }
};

// facturas
export const clientesDistintos = (carritofactura) => {
  // Usar un objeto para rastrear clientes únicos
  const uniqueClients = {};
  const filteredCarritofactura = carritofactura.filter((record) => {
    if (!uniqueClients[record.cliente]) {
      uniqueClients[record.cliente] = true;
      return true; // Mantener el registro
    }
    return false;
    // Filtrar el duplicado
  });
};
export const CrearFactura = async (cliente, usuario, fecha, hora) => {
  //? Inserción de factura en la base de datos
  const estado = true;
  const iva = 16;
  try {
    const querysql = `
      INSERT INTO factura (cliente, usuario, fecha, hora, iva, TipoF, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const queryValues = [cliente, usuario, fecha, hora, iva, Tipo, estado];
    const [result] = await db.execute(querysql, queryValues);
    if (result.affectedRows === 0) {
      return [];
    }
    return result.insertId; // Devolver el ID de la factura creada
  } catch (error) {
    console.error("Error al crear la factura:", error.stack);
    return [];
  }
};
export const EliminarFactura = async (factura, res) => {
  try {
    if (!factura || typeof factura !== "number") {
      console.error("ID de factura inválido");
      return false;
    }

    const querysql = "DELETE FROM factura WHERE id = ?";
    const [result] = await db.execute(querysql, [factura]);

    if (result.affectedRows === 0) {
      console.warn(`No se encontró una factura con el ID ${factura}`);
      return false;
    }

    console.log(`Factura con ID ${factura} eliminada exitosamente.`);
    return true; // La factura fue eliminada
  } catch (error) {
    console.error(
      `Error al eliminar la factura con ID ${factura}:`,
      error.message
    );
    return false; // Ocurrió un error
  }
};

export const DetallesFactura = async (factura, datos) => {
  try {
    if (!Array.isArray(datos) || datos.some((d) => d.includes(undefined))) {
      throw new Error("Datos incompletos o incorrectos");
    }

    const values = datos
      .map(
        ([producto, cantidad, precioUnidad]) =>
          `(${factura}, ${producto}, ${cantidad}, ${precioUnidad})`
      )
      .join(",");

    const querysql = `
      INSERT INTO detallesfactura (factura, producto, cantidad, precioUnidad) VALUES ${values}
    `;

    await db.execute(querysql);
    return true;
  } catch (error) {
    console.error("Error al crear detallesfactura:", error);
    return false;
  }
};

export const ValidarReferencia = (valor, pago) => {};

export const RestarStock = async (datos) => {
  if (!datos.length) {
    console.error("Error: No hay datos para procesar");
    return false;
  }

  const ids = [...new Set(datos.map(([producto]) => producto))].join(",");
  const cases = datos
    .map(
      ([producto, cantidadCarrito]) =>
        `WHEN ${producto} THEN cantidad - ${cantidadCarrito}`
    )
    .join(" ");

  const condiciones = datos
    .map(
      ([producto, cantidadCarrito]) =>
        `(id = ${producto} AND cantidad >= ${cantidadCarrito})`
    )
    .join(" OR ");

  if (!ids || !cases || !condiciones) {
    console.error("Error: Datos insuficientes o incorrectos");
    return false;
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const querysqlVerificar = `
      SELECT id, cantidad FROM producto 
      WHERE id IN (${ids}) AND (${condiciones});
    `;
    console.log("querysqlVerificar:", querysqlVerificar);

    const [rowsVerificar] = await connection.execute(querysqlVerificar);
    console.log(rowsVerificar);
    if (rowsVerificar.length !== datos.length) {
      throw new Error("Stock insuficiente para uno o más productos.");
    }

    const querysqlActualizar = `
      UPDATE producto 
      SET cantidad = CASE id ${cases} END
      WHERE id IN (${ids});
    `;
    console.log("querysqlActualizar:", querysqlActualizar);

    await connection.execute(querysqlActualizar);

    await connection.commit();
    return true;
  } catch (error) {
    console.error("Error al actualizar el stock:", error);
    await connection.rollback();
    return false;
  } finally {
    connection.release();
  }
};

export const DevolverStock = async (datos) => {
  const ids = datos.map(([producto]) => producto.id).join(",");
  const cases = datos
    .map(
      ([producto, cantidadCarrito]) =>
        `WHEN ${producto.id} THEN producto.cantidad + ${cantidadCarrito}`
    )
    .join(" ");

  const querysql = `
    START TRANSACTION;

    -- Bloquear las filas de los productos
    SELECT cantidad FROM producto WHERE producto.id IN (${ids}) FOR UPDATE;

    -- Actualizar las cantidades de los productos
    UPDATE producto 
    SET producto.cantidad = CASE producto.id ${cases} END
    WHERE producto.id IN (${ids});

    COMMIT;
  `;

  try {
    await db.execute(querysql);
    return true;
  } catch (error) {
    console.error("Error al actualizar el stock:", error);
    await db.execute("ROLLBACK;");
    return false;
  }
};
export const transformarYConsolidarDatos = (datos) => {
  const consolidado = {};

  datos.forEach(({ producto, cantidadCarrito, precio }) => {
    if (!consolidado[producto]) {
      consolidado[producto] = {
        cantidadCarrito: new Decimal(cantidadCarrito),
        precio,
      };
    } else {
      consolidado[producto].cantidadCarrito = consolidado[
        producto
      ].cantidadCarrito.plus(new Decimal(cantidadCarrito));
    }
  });

  return Object.entries(consolidado).map(
    ([producto, { cantidadCarrito, precio }]) => [
      parseInt(producto),
      cantidadCarrito.toNumber(),
      precio,
    ]
  );
};

export const VerificarStock = async () => {
  console.log({ msg: "Verificando stock" });
  const datos = await RevisarTodoCarritoF();
  console.log({ datos: datos });
  if (Array.isArray(datos) && datos.length > 0) {
    const ProductosCarrito = await ObtenerStockGeneral(datos);
    return ProductosCarrito;
  } else {
    console.log({ msg: "No hay productos en el carrito" });
    return { msg: "No hay productos en el carrito", res: false };
  }

  console.log({ datos, ProductosCarrito });

  const ProductosStock = "";
};
export const VerificarStockCarrito = async ({ producto, cantidad }) => {
  console.log({ msg: "Verificando stock" });

  try {
    // Obtener datos del carrito para el producto
    const datos = await RevisarCarritoProducto(producto);
    console.log({ datos });

    // Obtener el stock general del producto
    const ProductosStock = await ObtenerStockGeneral([
      { productoCarrito: producto, cantidadCarrito: cantidad },
    ]);

    if (!ProductosStock.length) {
      console.log({ msg: "No hay stock del producto" });
      return {
        msg: "No hay stock del producto",
        resp: false,
        disponible: 0,
      };
    }

    const cantidadStock = new Decimal(ProductosStock[0].CantidadEntrada);
    if (cantidadStock.isNegative()) {
      console.log({ msg: "Error en la entrada de productos", ProductosStock });
      return {
        msg: "Error en la entrada de productos",
        resp: false,
        disponible: 0,
      };
    }

    console.log({ cantidadStock });

    // Verificar si hay suficiente stock
    const stockRestante = cantidadStock.minus(cantidad);
    if (stockRestante.isNegative()) {
      return {
        msg: "No hay suficiente stock",
        resp: false,
        disponible: stockRestante.negated().toNumber(),
      };
    }

    // Consolidar cantidades si hay datos en el carrito
    if (datos.length > 0) {
      const ProductosCarrito = consolidarCantidad(
        datos,
        "productoCarrito",
        "cantidadCarrito"
      );

      const stockFinal = stockRestante.minus(
        ProductosCarrito[0].cantidadCarrito
      );
      if (stockFinal.isNegative()) {
        return {
          msg: "No hay suficiente stock",
          resp: false,
          disponible: stockFinal.negated().toNumber(),
        };
      }
    }

    return {
      msg: "Se puede agregar al carrito",
      resp: true,
      disponible: stockRestante.toNumber(),
    };
  } catch (error) {
    console.error("Error en VerificarStockCarrito:", error);
    return {
      msg: "Error al verificar el stock",
      resp: false,
      disponible: 0,
    };
  }
};
const actualizarCantidad = (datos, id, cantidad) => {
  return datos.map((item) => {
    if (item.productoCarrito === id) {
      return {
        ...item,
        cantidadCarrito: cantidad, // Actualizar cantidadCarrito
      };
    }
    return item; // Devolver el elemento sin cambios si no coincide
  });
};

const ObtenerProductosIgualesCarrito = async (datos) => {
  console.log({ msg: "Obteniendo productos del carrito" });
  try {
    // Extraer los valores de productoCarrito
    const idsArray = data.map((item) => item.productoCarrito);

    // Convertir a una cadena separada por comas
    const idsString = idsArray.join(",");

    // Construir la consulta SQL
    // se usar in cuando quieres obtener varios valores de una columna
    const querysql = `
    SELECT carritocompra.*, producto.id, producto.estado
    FROM carritocompra, producto
    WHERE producto.id = productoCarrito
    AND productoCarrito IN (${idsString})
`;
    const [result] = await db.execute(querysql, [idsArray]);
    if (result.length === 0) {
      console.error("No se encontraron resultados en la consulta.");
      return [];
    }

    return result;
  } catch (error) {
    console.error("Error al obtener los productos:", error.stack);
    return [];
  }
};
const ObtenerSalidaStock = async (data) => {
  console.log({ msg: "Obteniendo productos de salida de stock" });
  try {
    // Extraer los valores de productoCarrito
    const idsArray = data.map((item) => item.productoCarrito);

    // Convertir a una cadena separada por comas
    const idsString = idsArray.join(",");

    // Construir la consulta SQL
    // se usar in cuando quieres obtener varios valores de una columna
    const querysql = `
    	SELECT salidaproductos.*,
	  factura.id,factura.estado, 
	  producto.id, producto.estado
    FROM salidaproductos, producto, factura
    WHERE producto.id = ProductoSalida
    AND factura.id = FacturaSalida
    AND factura.estado=true
    AND EstadoSalida = true
    AND ProductoSalida IN (${idsString})
`;
    const [result] = await db.execute(querysql, [idsArray]);
    if (result.length === 0) {
      console.error("No se encontraron resultados en la consulta.");
      return [];
    }
    console.log({ msg: "result", result });
    // Retornar los resultados si existen
    return result;
  } catch (error) {
    console.error("Error al obtener los productos:", error.stack);
    return [];
  }
};
const ObtenerEntradaStock = async (data) => {
  console.log({ msg: "Obteniendo productos de entrada al stock" });
  try {
    // Extraer los valores de productoCarrito
    const idsArray = data.map((item) => item.productoCarrito);

    // Convertir a una cadena separada por comas
    const idsString = idsArray.join(",");

    // Construir la consulta SQL
    const querysql = `
      SELECT entradaproductos.*,
        compra.id, compra.estado, 
        producto.id, producto.estado
      FROM entradaproductos, producto, compra
      WHERE producto.id = ProductoEntrada
        AND compra.id = CompraEntrada
        AND compra.estado = true
        AND EstadoEntrada = true
        AND ProductoEntrada IN (${idsString})
    `;
    console.log({ msg: "entrada", idsString, data, querysql });

    const [result] = await db.execute(querysql, [idsArray]);

    // Si no se encuentran resultados, retornar un array vacío
    if (result.length === 0) {
      console.warn("No se encontraron resultados en la consulta.");
      return [];
    }
    console.log({ msg: "result", result });
    // Retornar los resultados si existen
    return result; // Retornar los resultados si existen
  } catch (error) {
    // Registrar el error y retornar un array vacío
    console.error("Error al obtener los productos:", error.stack);
    return [];
  }
};
const ObtenerStockGeneral = async (datos) => {
  try {
    // Obtener los datos de entrada al stock desde la base de datos
    const Entrada = await ObtenerEntradaStock(datos);

    // Obtener los datos de salida del stock desde la base de datos
    const Salida = await ObtenerSalidaStock(datos);

    // Validar si alguna de las consultas falló
    if (Entrada.length === 0 || Salida.length === 0) {
      console.error("Error en alguna de las consultas de entrada o salida.");
      return []; // Retornar false si hubo un error
    }

    // Consolidar las cantidades de entrada si hay datos disponibles
    const entradaConsolidada =
      Entrada.length > 0
        ? consolidarCantidad(Entrada, "ProductoEntrada", "CantidadEntrada")
        : []; // Si no hay datos, retornar un array vacío

    // Consolidar las cantidades de salida si hay datos disponibles
    const salidaConsolidada =
      Salida.length > 0
        ? consolidarCantidad(Salida, "ProductoSalida", "CantidadSalida")
        : []; // Si no hay datos, retornar un array vacío
    console.log({ entrada: entradaConsolidada, salida: salidaConsolidada });
    // Si hay tanto entradas como salidas, ajustar las cantidades
    if (entradaConsolidada.length > 0 && salidaConsolidada.length > 0) {
      console.log({
        msg: "Entradas y salidas consolidadas, ajustando cantidades",
      });
      return ajustarCantidades(entradaConsolidada, salidaConsolidada);
    }

    // Si solo hay entradas y no hay salidas, retornar las entradas consolidadas
    if (entradaConsolidada.length > 0 && salidaConsolidada.length === 0) {
      console.log({ msg: "Solo hay entradas consolidadas" });
      return entradaConsolidada;
    }

    // Si solo hay salidas y no hay entradas, registrar un error
    if (salidaConsolidada.length > 0 && entradaConsolidada.length === 0) {
      console.error("Error: Hay salidas sin entradas registradas.");
      return []; // Retornar [] si hay un error lógico
    }

    // Si no hay ni entradas ni salidas, retornar ambos arrays vacíos
  } catch (error) {
    // Capturar y registrar cualquier error que ocurra durante la ejecución
    console.error("Error en ObtenerStockGeneral:", error);
    return []; // Retornar false si ocurre un error inesperado
  }
};

const ajustarCantidades = (entrada, salida) => {
  // Crear un mapa para facilitar la búsqueda de productos de salida
  const salidaMap = salida.reduce((map, salidaItem) => {
    map[salidaItem.ProductoSalida] = new Decimal(salidaItem.CantidadSalida); // Usar Decimal para la cantidad de salida
    return map;
  }, {});

  // Iterar sobre los productos de entrada y ajustar las cantidades
  return entrada
    .map((entradaItem) => {
      const cantidadSalida = salidaMap[entradaItem.ProductoEntrada];

      if (cantidadSalida !== undefined) {
        // Si hay coincidencia, restar la cantidad de salida usando Decimal
        return {
          ...entradaItem,
          CantidadEntrada: new Decimal(entradaItem.CantidadEntrada)
            .minus(cantidadSalida)
            .toNumber(), // Convertir a número después de la resta
        };
      }

      // Si no hay coincidencia, devolver el elemento original
      return {
        ...entradaItem,
        CantidadEntrada: new Decimal(entradaItem.CantidadEntrada).toNumber(), // Asegurar que sea Decimal
      };
    })
    .concat(
      // Agregar los productos de salida que no tienen coincidencia en la entrada
      salida
        .filter(
          (salidaItem) =>
            !entrada.some(
              (entradaItem) =>
                entradaItem.ProductoEntrada === salidaItem.ProductoSalida
            )
        )
        .map((salidaItem) => ({
          ProductoEntrada: salidaItem.ProductoSalida,
          CantidadEntrada: new Decimal(salidaItem.CantidadSalida)
            .negated() // Representar la salida como un número negativo
            .toNumber(),
        }))
    );
};
const ajustarCantidadesStokCarrito = (entrada, salida) => {
  // Crear un mapa para facilitar la búsqueda de productos de salida
  const salidaMap = salida.reduce((map, salidaItem) => {
    map[salidaItem.productoCarrito] = new Decimal(salidaItem.cantidadCarrito); // Usar Decimal para la cantidad de salida
    return map;
  }, {});

  // Iterar sobre los productos de entrada y ajustar las cantidades
  return entrada
    .map((entradaItem) => {
      const cantidadCarrito = salidaMap[entradaItem.ProductoEntrada];

      if (cantidadCarrito !== undefined) {
        // Si hay coincidencia, restar la cantidad de salida usando Decimal
        return {
          ...entradaItem,
          CantidadEntrada: new Decimal(entradaItem.CantidadEntrada)
            .minus(cantidadCarrito)
            .toNumber(), // Convertir a número después de la resta
        };
      }

      // Si no hay coincidencia, devolver el elemento original
      return {
        ...entradaItem,
        CantidadEntrada: new Decimal(entradaItem.CantidadEntrada).toNumber(), // Asegurar que sea Decimal
      };
    })
    .concat(
      // Agregar los productos de salida que no tienen coincidencia en la entrada
      salida
        .filter(
          (salidaItem) =>
            !entrada.some(
              (entradaItem) =>
                entradaItem.ProductoEntrada === salidaItem.productoCarrito
            )
        )
        .map((salidaItem) => ({
          ProductoEntrada: salidaItem.productoCarrito,
          CantidadEntrada: new Decimal(salidaItem.cantidadCarrito)
            .negated() // Representar la salida como un número negativo
            .toNumber(),
        }))
    );
};
// data es el array de objetos que contiene los datos a consolidar
// keyProducto es la clave del producto en el objeto
// keyCantidad es la clave de la cantidad en el objeto
// Esta función consolidará los productos y sumará las cantidades
const consolidarCantidad = (data, keyProducto, keyCantidad) => {
  // Crear un mapa para consolidar los datos
  const acumulado = {};

  data.forEach((item) => {
    const producto = item[keyProducto];
    const cantidad = new Decimal(item[keyCantidad]); // Convertir a Decimal

    if (!acumulado[producto]) {
      // Crear una copia del objeto original y asignar la cantidad como Decimal
      acumulado[producto] = { ...item, [keyCantidad]: cantidad };
    } else {
      // Sumar la cantidad al objeto existente
      acumulado[producto][keyCantidad] =
        acumulado[producto][keyCantidad].plus(cantidad);
    }
  });

  // Convertir el mapa en un array de objetos
  return Object.values(acumulado).map((item) => ({
    ...item,
    [keyCantidad]: item[keyCantidad].toNumber(), // Convertir Decimal a número
  }));
};

export const RegistrarFormasDePago = async (factura, datos) => {
  console.log("datos", datos);
  try {
    const values = datos
      .map(
        ([forma, dinero, referencia]) =>
          `(${factura}, ${forma}, ${dinero}, ${referencia})`
      )
      .join(",");

    const querysql = `
      INSERT INTO pagofactura (factura, forma, cantidad, referencia) VALUES ${values}
    `;

    await db.execute(querysql);
    return true;
  } catch (error) {
    console.error("Error al registrar formas de pago:", error);
    return false;
  }
};
export const LimpiarCarrito = async (id) => {
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
};
export const handleRollback = async (res, facturaId, mensajeError) => {
  const eliminacionExitosa = await EliminarFactura(facturaId);
  res.send({
    res: false,
    msg: eliminacionExitosa
      ? mensajeError
      : `${mensajeError} y no se pudo eliminar los datos. El código de la factura es: ${facturaId}`,
  });
};
export const handleRollbackStock = async (
  res,
  facturaId,
  mensajeError,
  stock
) => {
  const Devolver = await DevolverStock(stock);

  const eliminacionExitosa = await EliminarFactura(facturaId);

  let msg = "";

  if (eliminacionExitosa == false) {
    msg += `hubo un error al elminar la factura cod:${facturaId}`;
  } else {
    msg += `${mensajeError} y no se pudo eliminar los datos. El código de la factura es: ${facturaId}`;
  }
  if (Devolver == false) {
    msg += `, además hubo un error al devolver los productos al inventario datos:${stock}`;
  }
  res.send({
    res: false,
    msg,
  });
};
