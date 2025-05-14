import { db } from "../config.js";
import { Decimal } from "decimal.js";
// Función para calcular
export const calcularCantidadProducto = async (connection, producto) => {
  const Decimal = require("decimal.js");

  try {
    // Obtener productos de entrada con estado válido
    const [ListaEntrada] = await connection.execute(
      "SELECT cantidad FROM entradaproductos WHERE ProductoEntrada = ? AND EstadoEntrada = 1",
      [producto]
    );

    // Obtener productos de salida con estado válido
    const [ListaSalida] = await connection.execute(
      "SELECT cantidad FROM salidaproductos WHERE ProductoSalida = ? AND EstadoSalida = 1",
      [producto]
    );

    // Sumar cantidades de entrada
    let cantidadTotalEntrada = new Decimal(0);
    ListaEntrada.forEach((entrada) => {
      cantidadTotalEntrada = cantidadTotalEntrada.plus(
        new Decimal(entrada.cantidad)
      );
    });

    // Sumar cantidades de salida
    let cantidadTotalSalida = new Decimal(0);
    ListaSalida.forEach((salida) => {
      cantidadTotalSalida = cantidadTotalSalida.plus(
        new Decimal(salida.cantidad)
      );
    });

    // Calcular la cantidad actual
    const cantidadFinal = cantidadTotalEntrada.minus(cantidadTotalSalida);

    return cantidadFinal;
  } catch (error) {
    //chequear porque puede bloquear la ejecucion del codigo

    // Manejo de errores
    console.error("Error al calcular la cantidad del producto:", error.message);
    throw new Error(
      "No se pudo calcular la cantidad del producto. Verifica las consultas."
    );
  }
};
export const CalcularDineroIngresado = (valor) => {
  let precio = new Decimal(0); // Inicializar con Decimal

  for (let i = 0; i < valor.length; i++) {
    if (typeof valor[i] === "object" && valor[i] > 0) {
      // Utilizar Decimal para los cálculos con objetos
      precio = precio.plus(new Decimal(valor[i]));
    } else if (typeof valor[i] === "number" && valor[i] > 0) {
      // Utilizar Decimal para los cálculos con números
      precio = precio.plus(new Decimal(valor[i]));
    }
  }

  return precio.toNumber(); // Convertir de vuelta a número normal
};
export const CalcularDineroRecibido = (valor) => {
  let precio = new Decimal(0); // Inicializar con Decimal

  for (let i = 0; i < valor.length; i++) {
    if (typeof valor[i] === "object" && valor[i] > 0) {
      // Utilizar Decimal para los cálculos con objetos
      precio = precio.plus(new Decimal(valor[i]));
    } else if (typeof valor[i] === "number" && valor[i] > 0) {
      // Utilizar Decimal para los cálculos con números
      precio = precio.plus(new Decimal(valor[i]));
    }
  }

  return precio.toNumber(); // Convertir de vuelta a número normal
};
export const CalcularTotalConIva = (valor, iva) => {
  const numero = new Decimal(valor);
  // Porcentaje a sumar
  const porcentaje = new Decimal(iva);
  // Convertir el porcentaje a decimal
  const factorPorcentaje = porcentaje.dividedBy(100);
  // Calcular el incremento
  const incremento = numero.times(factorPorcentaje);
  // Sumar el incremento al número inicial let resultado
  const resultado = numero.plus(incremento);
  // Retornar el resultado como cadena para evitar problemas de precisión
  return resultado.toString();
};
export const CalcularTotalSinIva = (valor) => {
  let precio = new Decimal(0); // Inicializar con Decimal
  console.log("se calcula el total sin iva, datos:", valor);
  for (let i = 0; i < valor.length; i++) {
    if (typeof valor[i] === "object" && valor[i].precio > 0) {
      // Utilizar Decimal para los cálculos con objetos
      precio = precio.plus(
        new Decimal(valor[i].precio).times(valor[i].cantidadCarrito)
      );
    } else if (typeof valor[i] === "number" && valor[i] > 0) {
      // Utilizar Decimal para los cálculos con números
      precio = precio.plus(new Decimal(valor[i]));
    }
  }
  console.log("precio sin iva:", precio.toString());
  return precio.toNumber(); // Convertir de vuelta a número normal
};
