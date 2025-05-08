//index.js
import { app, db } from "./config.js";
import express from "express";
import cors from "cors";
// Tu middleware de rutas aquí
import routerProveedor from "./rutas/Proveedor.js";
import routerProductos from "./rutas/Productos.js";
import routerClientes from "./rutas/Clientes.js";
import routerUsuario from "./rutas/Usuarios.js";
import routerLogin from "./rutas/Login.js";
import routerFactura from "./rutas/Factura.js";
import routerCarritoFactura from "./rutas/CarroFactura.js";
import routerCarritoCompra from "./rutas/CarroCompra.js";
import routerCompra from "./rutas/Compras.js";
import routerFormaPago from "./rutas/FormaPago.js";

const Puerto = 3001;

app.use(express.json());
app.use(cors());

// Middleware global para manejar errores de la base de datos

const VerificarBasedeDatos = async (err, req, res, next) => {
  if (err.code === "ECONNREFUSED") {
    console.error("Error de conexión a la base de datos:", err);
    res.status(500).json({
      mensaje:
        "Hay un problema con la conexión a la base de datos. Por favor, intenta más tarde.",
    });
  } else {
    console.log("se verifico la base de datos");
    next(err); // Pasa el error a otros middlewares si no es de base de datos
  }
};

const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "JSON mal formado" });
  }
  console.log("se valido el json enviado");
  next(err);
};

app.use(jsonErrorHandler);
app.use(VerificarBasedeDatos);
app.use("/Login", routerLogin);
app.use("/Clientes", routerClientes);
app.use("/Proveedor", routerProveedor);
app.use("/Productos", routerProductos);
app.use("/Usuarios", routerUsuario);
app.use("/Factura", routerFactura);
app.use("/Factura", routerCarritoFactura);
app.use("/Compra", routerCarritoCompra);
app.use("/Compra", routerCompra);
app.use("/FormaPago", routerFormaPago);

// Iniciar el servidor
app.listen(Puerto, () => {
  console.log(`Servidor escuchando en el puerto ${Puerto}`);
});
