import Joi from "joi";
import Decimal from "decimal.js";
import {
  customDecimalValidation,
  customIntValidation,
} from "./ValidacionesJoi.js";
export const ClienteCrear = Joi.object({
  nombre: Joi.string().required().messages({
    "string.base": "El nombre debe ser un texto.",
    "any.required": "El nombre es requerido.",
  }),
  cedulaRif: Joi.number()
    .custom((value, helpers) =>
      customDecimalValidation(
        value,
        helpers,
        "cédula/RIF",
        new Decimal(1000000),
        new Decimal(1000000000)
      )
    )
    .required()
    .messages({
      "any.required": "La cédula/RIF  es requerido.",
      "number.empty": "La cédula/RIF  no puede estar vacío.",
      "number.base": "La cédula/RIF debe ser un valor numerico.",
    }),
  direccion: Joi.string().required().messages({
    "string.base": "La dirección debe ser un texto.",
    "any.required": "La dirección es requerida.",
  }),
  tipo: Joi.string().required().messages({
    "string.base": "El tipo debe ser un texto.",
    "any.required": "El tipo es requerido.",
  }),
  ultimoNumero: Joi.number().integer().min(0).max(9).optional().messages({
    "number.base": "El último número debe ser un número entero.",
    "any.required": "El último número es obligatorio.",
    "number.min": "El último número debe ser minimo {#limit}.",
    "number.max": "El último número no puede exceder de {#limit}.",
  }),
  tlf: Joi.custom((value, helpers) =>
    customDecimalValidation(
      value,
      helpers,
      "teléfono",
      new Decimal(1000000000),
      new Decimal(90000000000)
    )
  )
    .required()
    .messages({
      "any.required": "El El teléfono es obligatorio.",
      "number.empty": "El El teléfono no puede estar vacío.",
      "number.base": "El El teléfono debe ser en caracter.",
    }),
})
  .unknown(false)
  .messages({ "object.unknown": "El campo {#label} no está permitido." });

export const ClienteUpdate = Joi.object({
  id: Joi.number().required().integer().messages({
    "number.base": "El id debe ser un número.",
    "any.required": "El campo id es obligatorio.",
    "number.empty": "El campo id no puede estar vacío.",
    "number.integer": "El id debe ser un número entero.",
  }),
  nombre: Joi.string().optional().messages({
    "string.base": "El nombre debe ser un texto.",
    "any.required": "El nombre es requerido.",
  }),
  cedulaRif: Joi.number()
    .custom((value, helpers) =>
      customDecimalValidation(
        value,
        helpers,
        "cédula/RIF",
        new Decimal(1000000),
        new Decimal(1000000000)
      )
    )
    .required()
    .messages({
      "any.required": "La cédula/RIF  es requerido.",
      "number.empty": "La cédula/RIF  no puede estar vacío.",
      "number.base": "La cédula/RIF debe ser un valor numerico.",
    }),
  direccion: Joi.string().optional().messages({
    "string.base": "La dirección debe ser un texto.",
    "any.required": "La dirección es requerida.",
  }),
  tipo: Joi.string().optional().messages({
    "string.base": "El tipo debe ser un texto.",
    "any.required": "El tipo es requerido.",
  }),
  ultimoNumero: Joi.number().integer().min(0).max(9).optional().messages({
    "number.base": "El último número debe ser un número entero.",
    "any.required": "El último número es obligatorio.",
    "number.min": "El último número debe ser minimo {#limit}.",
    "number.max": "El último número no puede exceder de {#limit}.",
  }),
  tlf: Joi.custom((value, helpers) =>
    customDecimalValidation(
      value,
      helpers,
      "teléfono",
      new Decimal(1000000000),
      new Decimal(90000000000)
    )
  )
    .optional()
    .messages({
      "any.required": "El El teléfono es obligatorio.",
      "number.empty": "El El teléfono no puede estar vacío.",
      "number.base": "El El teléfono debe ser en caracter.",
    }),
})
  .unknown(false)
  .messages({ "object.unknown": "El campo {#label} no está permitido." });

export const validateClienteCreate = (req, res, next) => {
  const { error, value } = ClienteCrear.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    const varaiblesError = error.details.map((detail) => detail.context.label);

    return res
      .status(400)
      .send({ res: false, msg: messages, varaiblesError: varaiblesError });
  }

  req.body = value;
  next();
};
export const validateClienteUpdate = (req, res, next) => {
  const { error, value } = ClienteUpdate.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    const varaiblesError = error.details.map((detail) => detail.context.label);

    return res
      .status(400)
      .send({ res: false, msg: messages, varaiblesError: varaiblesError });
  }

  req.body = value;
  next();
};
