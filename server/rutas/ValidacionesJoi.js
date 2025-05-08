const decimalPattern = /^\d+(\.\d+)?$/;
import Decimal from "decimal.js";
// Validación personalizada para usar Decimal.js
const customDecimalValidation = (value, helpers, name, min, max) => {
  const decimalPattern = /^[+-]?(\d*\.)?\d+$/; // Ejemplo de patrón decimal

  if (!decimalPattern.test(value)) {
    return helpers.message(
      `El campo ${name} debe ser un valor decimal válido y no en notación exponencial.`
    );
  }
  try {
    const decimal = new Decimal(value);
    if (decimal.isNaN()) {
      return helpers.message(`El campo ${name} no es válido.`);
    }
    if (decimal.isNegative()) {
      return helpers.message(`El campo ${name} debe ser positivo.`);
    }
    if (decimal.lessThan(min)) {
      return helpers.message(`El campo ${name} debe ser al menos ${min}.`);
    }
    if (decimal.greaterThan(max)) {
      return helpers.message(`El campo ${name} no puede exceder ${max}.`);
    }
  } catch (err) {
    return helpers.message(`El campo ${name} no es válido.`);
  }
  return value;
};

const intPattern = /^\d+$/;
// Validación personalizada para enteros
const customIntValidation = (value, helpers, name, min, max) => {
  if (!intPattern.test(value)) {
    return helpers.message(
      "El número debe ser un entero válido y no en notación exponencial."
    );
  }
  const intValue = parseInt(value, 10);
  if (isNaN(intValue)) {
    return helpers.message(`El campo ${name} no es válido.`);
  }
  if (intValue < min) {
    return helpers.message(`El campo ${name} debe ser al menos ${min}.`);
  }
  if (intValue > max) {
    return helpers.message(`El campo ${name} no puede exceder ${max}.`);
  }
  return value;
};
export { customDecimalValidation, customIntValidation };
