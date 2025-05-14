import jwt from "jsonwebtoken";
import { jwtSecret } from "../config.js"; // Asegúrate de que la ruta sea correcta

const MostrarErrores = (res, err) => {
  console.error({
    msg: "Ocurrió un error inesperado. Por favor, intente nuevamente más tarde.",
    err: err.stack,
  });
  return res.status(500).json({
    res: false,
    msg: "Ocurrió un error inesperado. Por favor, intente nuevamente más tarde.",
  });
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Definir la función MostrarErrores en req
  req.MostrarErrores = (err) => MostrarErrores(res, err);

  if (!authHeader) {
    return res.status(403).send("Token no proporcionado");
  }

  const token = authHeader.split(" ")[1]; // Eliminar el prefijo "Bearer"
  if (!token) {
    return res.status(403).send("Token no válido");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.usuario = decoded; // Cambiado a req.usuario
    next();
  } catch (err) {
    req.MostrarErrores(err); // Utilizar MostrarErrores
  }
};

export const verifyLevelAdmin = () => {
  // Middleware para verificar el nivel de usuario
  return (req, res, next) => {
    console.log("validad nivel de usuario:Administrador");
    try {
      const requiredLevel = 1;
      if (req.usuario.nivel !== requiredLevel) {
        console.log("el usuario no tiene los permisos, ha sido explusado");
        return res.status(403).send("Nivel de usuario no autorizado");
      }
      console.log(
        "El usuario cuanta con los permisos adecuados, puede proceder."
      );
      next();
    } catch (err) {
      req.MostrarErrores(err);
    }
  };
};

export const verifyLevelMedium = () => {
  return (req, res, next) => {
    try {
      const admin = 1;
      const requiredLevel = 2;
      if (req.usuario.nivel !== requiredLevel && req.usuario.nivel !== admin) {
        return res.status(403).send("Nivel de usuario no autorizado");
      }

      next();
    } catch (err) {
      req.MostrarErrores(err);
    }
  };
};

export const verifyLevelLow = () => {
  return (req, res, next) => {
    const admin = 1;
    const requiredLevel = 2;
    const trabajador = 3;
    try {
      if (
        req.usuario.nivel !== requiredLevel &&
        req.usuario.nivel !== admin &&
        req.usuario.nivel !== trabajador
      ) {
        return res.status(403).send("Nivel de usuario no autorizado");
      }
      next();
    } catch (err) {
      req.MostrarErrores(err);
    }
  };
};
