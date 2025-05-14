import Joi from "joi";
import Decimal from "decimal.js";
import {
  customDecimalValidation,
  customIntValidation,
} from "./ValidacionesJoi.js";
const proveedorRegistro = Joi.object({
  rif: Joi.number()
    .custom((value, helpers) =>
      customDecimalValidation(
        value,
        helpers,
        "RIF",
        new Decimal(0),
        new Decimal(1000000000)
      )
    )
    .required()
    .messages({
      "any.required": "El RIF es obligatorio.",
      "number.empty": "El RIF no puede estar vacío.",
      "number.base": "El RIF debe ser numerico.",
    }),
  nombre: Joi.string().min(3).max(100).required().messages({
    "string.min": "El nombre debe tener al menos 3 caracteres.",
    "string.max": "El nombre no puede tener más de 100 caracteres.",
    "string.base": "El nombre debe ser un texto.",
    "string.empty": "El nombre es obligatorio.",
    "any.required": "El nombre es obligatorio.",
  }),
  direccion: Joi.string().required().max(200).messages({
    "string.max": "La dirección no puede tener más de 200 caracteres.",
    "any.required": "La dirección es obligatorio.",
    "string.base": "La dirección debe ser un texto.",
    "string.empty": "La dirección es obligatorio.",
  }),
  correo: Joi.string().email().required().messages({
    "string.email": "El correo debe ser un correo electrónico válido.",
    "string.base": "La dirección debe ser un texto.",
    "string.empty": "El correo es obligatorio.",
    "any.required": "El correo es obligatorio.",
  }),
  tipoRif: Joi.number().integer().min(0).max(10).required().messages({
    "number.empty": "El tipo de RIF es obligatorio.",
    "number.base": "El tipo de RIF debe ser un número",
    "number.min": "El tipo de RIF debe ser minimo {#limit}.",
    "number.max": "El tipo de RIF no puede exceder de {#limit}.",
    "any.required": "El tipo de RIF es obligatorio.",
  }),
  ultimoNumero: Joi.number().integer().min(0).max(9).required().messages({
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

const proveedorUpdate = Joi.object({
  id: Joi.number().required().messages({
    "number.base": "El id debe ser un número.",
    "any.required": "El campo id es obligatorio.",
    "number.empty": "El campo id no puede estar vacío.",
  }),
  rif: Joi.number()
    .custom((value, helpers) =>
      customDecimalValidation(
        value,
        helpers,
        "RIF",
        new Decimal(0),
        new Decimal(1000000000)
      )
    )
    .optional()
    .messages({
      "any.required": "El RIF es obligatorio.",
      "number.empty": "El RIF no puede estar vacío.",
      "number.base": "El RIF debe ser en caracter.",
    }),
  nombre: Joi.string().min(3).max(100).optional().messages({
    "string.min": "El nombre debe tener al menos 3 caracteres.",
    "string.max": "El nombre no puede tener más de 100 caracteres.",
    "string.base": "El nombre debe ser un texto.",
    "string.empty": "El nombre es obligatorio.",
    "any.required": "El nombre es obligatorio.",
  }),
  direccion: Joi.string().optional().max(200).messages({
    "string.max": "La dirección no puede tener más de 200 caracteres.",
    "any.required": "La dirección es obligatorio.",
    "string.base": "La dirección debe ser un texto.",
    "string.empty": "La dirección es obligatorio.",
  }),
  correo: Joi.string().email().optional().messages({
    "string.email": "El correo debe ser un correo electrónico válido.",
    "string.empty": "El correo es obligatorio.",
    "string.base": "El correo debe ser un texto.",
    "any.required": "El correo es obligatorio.",
  }),
  tipoRif: Joi.number().integer().min(0).max(10).optional().messages({
    "number.empty": "El tipo de RIF es obligatorio.",
    "number.min": "El tipo de RIF debe ser minimo {#limit}.",
    "number.max": "El tipo de RIF no puede exceder de {#limit}.",
    "number.base": "El tipo de RIF debe ser un número",
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

const validateProveedorCreate = (req, res, next) => {
  const { error, value } = proveedorRegistro.validate(req.body, {
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
const validateProveedorUpdate = (req, res, next) => {
  const { error, value } = proveedorUpdate.validate(req.body, {
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

export { validateProveedorCreate, validateProveedorUpdate };
