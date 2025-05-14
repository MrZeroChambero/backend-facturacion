const validator = require("validator");

export const validarCorreo = (email) => {
  const min = 10;
  const max = 50;

  if (!validator.isEmail(email)) {
    return { resultado: false, msg: "No es un correo válido" };
  }
  if (!validator.isLength(email, { min, max })) {
    return {
      resultado: false,
      msg: `Debe tener entre ${min} y ${max} caracteres`,
    };
  }

  return { resultado: true, msg: "Correo válido" };
};

export const validarLetrasNumeros = (valor, nombre) => {
  const min = 10;
  const max = 50;
  const regex = /^[A-Za-zñÑáéíóúÁÉÍÓÚüÜ0-9\s]+$/;

  if (
    typeof valor !== "string" ||
    valor.trim() === "" ||
    !regex.test(valor.trim())
  ) {
    return {
      resultado: false,
      msg: `${nombre}: Inválido`,
    };
  }

  if (!validator.isLength(valor.trim(), { min, max })) {
    return {
      resultado: false,
      msg: `${nombre}: Debe tener entre ${min} y ${max} caracteres`,
    };
  }

  return { resultado: true, msg: `${nombre}: válido` };
};
