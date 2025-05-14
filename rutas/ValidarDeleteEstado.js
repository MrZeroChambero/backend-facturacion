import Decimal from "decimal.js";
import { customIntValidation } from "./ValidacionesJoi.js";
import Joi from "joi";
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
      "number.base": "El campo ID debe ser un número.",
    }),
  estado: Joi.boolean().required().messages({
    "boolean.base": "El campo Estado debe ser un valor booleano.",
    "any.required": "El campo Estado es obligatorio.",
    "boolean.empty": "El campo Estado no puede estar vacío.",
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
      "number.base": "El campo ID debe ser un número.",
    }),
})
  .unknown(false)
  .messages({ "object.unknown": "El campo {#label} no está permitido." });

const Busqueda = Joi.object({
  estado: Joi.boolean().required().messages({
    "boolean.base": "El campo Estado debe ser un valor booleano.",
    "any.required": "El campo Estado es obligatorio.",
    "boolean.empty": "El campo Estado no puede estar vacío.",
  }),
  query: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9 ]*$"))
    .required()
    .messages({
      "string.base": "El campo Búsqueda debe ser un texto.",
      "any.required": "El campo Búsqueda es obligatorio.",
      "string.empty": "El campo Búsqueda no puede estar vacío.",
      "string.pattern.base":
        "El campo Búsqueda solo puede contener caracteres alfanuméricos y espacios.",
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
    return res.status(400).send({ res: false, msg: messages });
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
    return res.status(400).send({ res: false, msg: messages });
  }

  req.body = value;
  next();
};
const validateBusqueda = (req, res, next) => {
  const dataToValidate = {
    estado: req.params.estado === "true", // Convertir a booleano
    query: req.params.query,
  };
  const { error, value } = Busqueda.validate(dataToValidate, {
    abortEarly: false,
  });
  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return res.status(400).send({ res: false, msg: messages });
  }
  req.body = value;
  next();
};
export { validateDataEstado, validateDelete, validateBusqueda };
