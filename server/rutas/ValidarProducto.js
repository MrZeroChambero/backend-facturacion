import Decimal from "decimal.js";
import Joi from "joi";
import {
  customDecimalValidation,
  customIntValidation,
} from "./ValidacionesJoi.js";
const noExtraSpaces = /^(?! )[a-zA-Z0-9 ]*(?<! )$/;
const schemaRequired = Joi.object({
  cod: Joi.number().required().messages({
    "number.base": "El código debe ser un número.",
    "any.required": "El campo código es obligatorio.",
    "number.empty": "El campo código no puede estar vacío.",
  }),
  nombre: Joi.string()
    .pattern(noExtraSpaces)
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.pattern.base":
        "El campo nombre solo puede contener letras, números y espacios simples, y no puede empezar ni terminar con un espacio.",
      "string.base": "El nombre debe ser un texto.",
      "any.required": "El campo nombre es obligatorio.",
      "string.empty": "El campo nombre no puede estar vacío.",
      "string.min": "El nombre debe tener al menos {#limit} caracteres.",
      "string.max": "El nombre no puede tener más de {#limit} caracteres.",
    }),
  descripcion: Joi.string().required().messages({
    "string.base": "La descripción debe ser un texto.",
    "any.required": "El campo descripción es obligatorio.",
    "string.empty": "El campo descripción no puede estar vacío.",
  }),
  precio: Joi.number()
    .custom((value, helpers) =>
      customDecimalValidation(
        value,
        helpers,
        "precio",
        new Decimal(0.01),
        new Decimal(10000)
      )
    )
    .required()
    .messages({
      "any.required": "El campo precio es obligatorio.",
      "number.empty": "El campo precio no puede estar vacío.",
    }),
  tipo: Joi.string().required().messages({
    "string.base": "El tipo debe ser un texto.",
    "any.required": "El campo tipo es obligatorio.",
    "string.empty": "El campo tipo no puede estar vacío.",
  }),
  medicion: Joi.string().required().messages({
    "string.base": "La medición debe ser un texto.",
    "any.required": "El campo medición es obligatorio.",
    "string.empty": "El campo medición no puede estar vacío.",
  }),
  stockmin: Joi.number()
    .custom((value, helpers) =>
      customDecimalValidation(
        value,
        helpers,
        "stock mínimo",
        new Decimal(0),
        new Decimal(1000)
      )
    )
    .required()
    .messages({
      "any.required": "El campo stock mínimo es obligatorio.",
      "number.empty": "El campo stock mínimo no puede estar vacío.",
      "number.base": "El campo stock mínimo debe ser en caracter.",
    }),
  stockmax: Joi.number()
    .custom((value, helpers) =>
      customDecimalValidation(
        value,
        helpers,
        "stock máximo",
        new Decimal(0),
        new Decimal(1000)
      )
    )
    .required()
    .messages({
      "any.required": "El campo stock máximo es obligatorio.",
      "number.empty": "El campo stock máximo no puede estar vacío.",
      "number.base": "El campo stock máximo debe ser en caracter.",
    }),
})
  .unknown(false)
  .messages({ "object.unknown": "El campo {#label} no está permitido." })
  .custom((value, helpers) => {
    if (value.stockmin > value.stockmax) {
      return helpers.message(
        "El stock mínimo no puede ser mayor que el stock máximo."
      );
    }
    return value;
  });

const schemaUpdate = Joi.object({
  id: Joi.number().required().messages({
    "number.base": "El id debe ser un número.",
    "any.required": "El campo id es obligatorio.",
    "number.empty": "El campo id no puede estar vacío.",
  }),
  cod: Joi.number().optional().messages({
    "number.base": "El código debe ser un número.",
    "number.empty": "El campo código no puede estar vacío.",
  }),

  nombre: Joi.string()
    .pattern(noExtraSpaces)
    .min(3)
    .max(30)
    .optional()
    .messages({
      "string.base": "El nombre debe ser un texto.",
      "string.pattern.base":
        "El campo nombre solo puede contener letras, números y espacios simples, y no puede empezar ni terminar con un espacio.",
      "string.empty": "El campo nombre no puede estar vacío.",
      "string.min": "El nombre debe tener al menos {#limit} caracteres.",
      "string.max": "El nombre no puede tener más de {#limit} caracteres.",
    }),
  descripcion: Joi.string().pattern(noExtraSpaces).optional().messages({
    "string.pattern.base":
      "La descripción solo puede contener letras y números.",
    "string.base": "La descripción debe ser un texto.",
    "string.empty": "El campo descripción no puede estar vacío.",
  }),
  precio: Joi.number().optional().messages({
    "number.base": "El precio debe ser un número.",
    "number.empty": "El campo precio no puede estar vacío.",
  }),
  tipo: Joi.string().optional().messages({
    "string.base": "El tipo debe ser un texto.",
    "string.empty": "El campo tipo no puede estar vacío.",
  }),
  medicion: Joi.string().optional().messages({
    "string.base": "La medición debe ser un texto.",
    "string.empty": "El campo medición no puede estar vacío.",
  }),
  stockmin: Joi.number()
    .custom((value, helpers) =>
      customDecimalValidation(
        value,
        helpers,
        "stock mínimo",
        new Decimal(0),
        new Decimal(1000000000)
      )
    )
    .optional()
    .messages({
      "any.required": "El campo stock mínimo es obligatorio.",
      "number.base": "El campo stock mínimo debe ser en caracter.",
      "number.empty": "El campo stock mínimo no puede estar vacío.",
    }),
  stockmax: Joi.number()
    .custom((value, helpers) =>
      customDecimalValidation(
        value,
        helpers,
        "stock máximo",
        new Decimal(0),
        new Decimal(1000000000)
      )
    )
    .optional()
    .messages({
      "any.required": "El campo stock máximo es obligatorio.",
      "number.empty": "El campo stock máximo no puede estar vacío.",
      "number.base": "El campo stock máximo debe ser en caracter.",
    }),
})
  .unknown(false)
  .messages({ "object.unknown": "El campo {#label} no está permitido." })
  .custom((value, helpers) => {
    if (value.stockmin > value.stockmax) {
      return helpers.message(
        "El stock mínimo no puede ser mayor que el stock máximo."
      );
    }
    return value;
  });

const schemaEstado = Joi.object({
  id: Joi.number()
    .custom((value, helpers) =>
      customIntValidation(
        value,
        helpers,
        "id",
        new Decimal(0),
        new Decimal(1000000000)
      )
    )
    .required()
    .messages({
      "number.empty": "El campo ID no puede estar vacío.",
      "any.required": "El campo ID es obligatorio.",
    }),
  estado: Joi.boolean().required().messages({
    "boolean.base": "El campo Estado debe ser un valor booleano.",
    "any.required": "El campo Estado es obligatorio.",
  }),
})
  .unknown(false)
  .messages({ "object.unknown": "El campo {#label} no está permitido." });
const schemaDelete = Joi.object({
  id: Joi.number()
    .custom((value, helpers) =>
      customIntValidation(
        value,
        helpers,
        "id",
        new Decimal(0),
        new Decimal(1000000000)
      )
    )
    .required()
    .messages({
      "number.empty": "El campo ID no puede estar vacío.",
      "any.required": "El campo ID es obligatorio.",
    }),
})
  .unknown(false)
  .messages({ "object.unknown": "El campo {#label} no está permitido." });

const validateDataEstado = (req, res, next) => {
  const { error, value } = schemaEstado.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return res.status(400).send({ res: false, errors: messages });
  }

  req.body = value;
  next();
};
const validateDelete = (req, res, next) => {
  const { error, value } = schemaDelete.validate(req.params, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return res.status(400).send({ res: false, errors: messages });
  }

  req.body = value;
  next();
};

const validateProductCreate = (req, res, next) => {
  const { error, value } = schemaRequired.validate(req.body, {
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
const validateProductUpdate = (req, res, next) => {
  const { error, value } = schemaUpdate.validate(req.body, {
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
export {
  validateProductCreate,
  validateProductUpdate,
  validateDataEstado,
  validateDelete,
};
