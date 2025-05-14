-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-05-2025 a las 01:36:02
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `facturacion`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria`
--

CREATE TABLE `auditoria` (
  `id` int(10) NOT NULL,
  `usuario` int(10) NOT NULL,
  `registro` varchar(80) NOT NULL,
  `accion` varchar(80) NOT NULL,
  `campo` varchar(80) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carritocompra`
--

CREATE TABLE `carritocompra` (
  `id` int(10) NOT NULL,
  `usuarioCarrito` int(10) NOT NULL,
  `productoCarrito` int(10) NOT NULL,
  `proveedorCarrito` int(10) NOT NULL,
  `cantidadCarrito` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carritocompra`
--

INSERT INTO `carritocompra` (`id`, `usuarioCarrito`, `productoCarrito`, `proveedorCarrito`, `cantidadCarrito`) VALUES
(34, 1, 2, 1, 657),
(35, 1, 4, 1, 7),
(36, 1, 5, 1, 9),
(37, 2, 3, 1, 99),
(38, 2, 3, 1, 72);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carritofactura`
--

CREATE TABLE `carritofactura` (
  `id` int(10) NOT NULL,
  `usuario` int(10) NOT NULL,
  `productoCarrito` int(10) NOT NULL,
  `cantidadCarrito` float NOT NULL,
  `clienteCarrito` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carritofactura`
--

INSERT INTO `carritofactura` (`id`, `usuario`, `productoCarrito`, `cantidadCarrito`, `clienteCarrito`) VALUES
(7, 1, 1, 5, 1),
(8, 1, 6, 9, 1),
(9, 1, 5, 6, 1),
(11, 2, 2, 23, 3),
(40, 1, 2, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id` int(10) NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `cedulaRif` varchar(9) NOT NULL,
  `tipo` varchar(1) NOT NULL,
  `direccion` varchar(80) NOT NULL,
  `tlf` int(11) UNSIGNED ZEROFILL NOT NULL,
  `ultimoNumero` int(1) DEFAULT NULL,
  `estado` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id`, `nombre`, `cedulaRif`, `tipo`, `direccion`, `tlf`, `ultimoNumero`, `estado`) VALUES
(1, 'cliente', '5670', 'h', 'kako', 04120000000, 1, 1),
(2, 'cliente2', '5670', 'h', 'kako', 04120000000, 1, 0),
(3, 'cliente3', '2160', 'G', 'palo woco', 04126667000, 2, 1),
(4, 'cliente4', '2160', 'G', 'palo woco', 04126667000, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `composicion`
--

CREATE TABLE `composicion` (
  `id` int(10) NOT NULL,
  `producto` int(10) NOT NULL,
  `materia` int(10) NOT NULL,
  `cantidad` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra`
--

CREATE TABLE `compra` (
  `id` int(10) NOT NULL,
  `tipo` varchar(30) NOT NULL,
  `usuario` int(10) NOT NULL,
  `proveedor` int(10) NOT NULL,
  `fechaCreacion` date NOT NULL,
  `fechaRecepcion` date NOT NULL,
  `hora` time NOT NULL,
  `iva` float NOT NULL,
  `estado` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `compra`
--

INSERT INTO `compra` (`id`, `tipo`, `usuario`, `proveedor`, `fechaCreacion`, `fechaRecepcion`, `hora`, `iva`, `estado`) VALUES
(25, 'Orden de Compra', 1, 1, '2025-04-11', '2023-10-01', '18:46:31', 16, 1),
(26, 'Orden de Compra', 1, 1, '2025-04-13', '2023-10-01', '17:46:17', 16, 1),
(27, 'Orden de Compra', 1, 1, '2025-04-13', '2023-10-01', '17:49:01', 16, 1),
(28, 'Orden de Compra', 1, 1, '2025-04-13', '2023-10-01', '17:52:32', 16, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detallescompra`
--

CREATE TABLE `detallescompra` (
  `id` int(10) NOT NULL,
  `compra` int(10) NOT NULL,
  `producto` int(10) NOT NULL,
  `cantidad` float NOT NULL,
  `costoUnidad` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detallescompra`
--

INSERT INTO `detallescompra` (`id`, `compra`, `producto`, `cantidad`, `costoUnidad`) VALUES
(61, 25, 2, 5, 17),
(62, 25, 4, 7, 25),
(63, 25, 5, 9, 15),
(64, 28, 2, 5, 17),
(65, 28, 4, 7, 25),
(66, 28, 5, 9, 15);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detallesfactura`
--

CREATE TABLE `detallesfactura` (
  `id` int(10) NOT NULL,
  `factura` int(10) NOT NULL,
  `producto` int(10) NOT NULL,
  `cantidad` float NOT NULL,
  `precioUnidad` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detallesfactura`
--

INSERT INTO `detallesfactura` (`id`, `factura`, `producto`, `cantidad`, `precioUnidad`) VALUES
(305, 81, 1, 6, 10),
(306, 81, 3, 21, 10),
(307, 81, 4, 6, 25);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entradaproductos`
--

CREATE TABLE `entradaproductos` (
  `id` int(20) NOT NULL,
  `CantidadEntrada` int(20) NOT NULL,
  `ProductoEntrada` int(20) NOT NULL,
  `CompraEntrada` int(20) NOT NULL,
  `FechaEntrada` date NOT NULL,
  `EstadoEntrada` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `entradaproductos`
--

INSERT INTO `entradaproductos` (`id`, `CantidadEntrada`, `ProductoEntrada`, `CompraEntrada`, `FechaEntrada`, `EstadoEntrada`) VALUES
(31, 5, 2, 25, '2023-10-01', 1),
(32, 7, 4, 25, '2023-10-01', 1),
(33, 9, 5, 25, '2023-10-01', 1),
(34, 7, 2, 28, '2023-10-01', 1),
(35, 7, 4, 28, '2023-10-01', 1),
(36, 9, 5, 28, '2023-10-01', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `id` int(10) NOT NULL,
  `cliente` int(10) NOT NULL,
  `usuario` int(10) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `iva` float NOT NULL,
  `TipoF` varchar(30) NOT NULL,
  `estado` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `factura`
--

INSERT INTO `factura` (`id`, `cliente`, `usuario`, `fecha`, `hora`, `iva`, `TipoF`, `estado`) VALUES
(81, 1, 1, '2024-12-24', '23:41:31', 16, 'Factura', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formaspago`
--

CREATE TABLE `formaspago` (
  `id` int(10) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `estado` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `formaspago`
--

INSERT INTO `formaspago` (`id`, `nombre`, `estado`) VALUES
(1, 'Trajeta', 1),
(2, 'Transferencia', 1),
(3, 'Efectivo', 1),
(4, 'Pago Movil', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `intentosseguridad`
--

CREATE TABLE `intentosseguridad` (
  `id` int(10) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `cantidad` int(1) NOT NULL,
  `ip` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(10) NOT NULL,
  `usuario` int(10) NOT NULL,
  `tipo` varchar(80) NOT NULL,
  `descripcion` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagocompra`
--

CREATE TABLE `pagocompra` (
  `id` int(10) NOT NULL,
  `compra` int(10) NOT NULL,
  `forma` int(10) NOT NULL,
  `cantidad` float NOT NULL,
  `referencia` int(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pagocompra`
--

INSERT INTO `pagocompra` (`id`, `compra`, `forma`, `cantidad`, `referencia`) VALUES
(31, 25, 1, 200, 1),
(32, 25, 2, 200.2, 2),
(33, 25, 3, 87, 3),
(34, 28, 1, 200, 1),
(35, 28, 2, 200.2, 2),
(36, 28, 3, 87, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagofactura`
--

CREATE TABLE `pagofactura` (
  `id` int(10) NOT NULL,
  `factura` int(10) NOT NULL,
  `forma` int(10) NOT NULL,
  `cantidad` float NOT NULL,
  `referencia` int(40) UNSIGNED ZEROFILL NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pagofactura`
--

INSERT INTO `pagofactura` (`id`, `factura`, `forma`, `cantidad`, `referencia`) VALUES
(67, 81, 1, 200, 0000000000000000000000000000000000000001),
(68, 81, 2, 200.2, 0000000000000000000000000000000000000002),
(69, 81, 3, 87, 0000000000000000000000000000000000000003);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preguntas`
--

CREATE TABLE `preguntas` (
  `id` int(10) NOT NULL,
  `usuario` int(10) NOT NULL,
  `pregunta` int(40) NOT NULL,
  `respuesta` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id` int(10) NOT NULL,
  `cod` varchar(20) NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `descripcion` varchar(40) NOT NULL,
  `version` int(11) NOT NULL,
  `precio` float NOT NULL,
  `tipo` varchar(10) NOT NULL,
  `medicion` varchar(10) NOT NULL,
  `stockmin` int(10) NOT NULL,
  `stockmax` int(10) NOT NULL,
  `estado` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id`, `cod`, `nombre`, `descripcion`, `version`, `precio`, `tipo`, `medicion`, `stockmin`, `stockmax`, `estado`) VALUES
(1, '123', 'coca', 'tas fina', 328, 10, 'materia Pr', 'unidad', 10, 100, 1),
(2, '890', 'kamarillosos', 'takioken', 510, 17, 'herramient', 'unidad', 5, 110, 1),
(3, '123', 'coca', 'tas fina', 348, 10, 'materia Pr', 'unidad', 10, 100, 1),
(4, '163', 'azulito', 'i am blue', 172, 25, 'Producto F', 'lt', 10, 100, 1),
(5, '723', 'amarillo', 'kioken', 948, 15, 'multi uso', 'lt', 10, 100, 1),
(6, '123', 'coca', 'tas fina', 394, 10, 'materia Pr', 'unidad', 10, 100, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

CREATE TABLE `proveedor` (
  `id` int(10) NOT NULL,
  `rif` int(11) UNSIGNED ZEROFILL NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `direccion` varchar(100) NOT NULL,
  `correo` varchar(60) NOT NULL,
  `tipoRif` varchar(1) NOT NULL,
  `ultimoNumero` int(1) NOT NULL,
  `tlf` int(11) UNSIGNED ZEROFILL NOT NULL,
  `estado` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedor`
--

INSERT INTO `proveedor` (`id`, `rif`, `nombre`, `direccion`, `correo`, `tipoRif`, `ultimoNumero`, `tlf`, `estado`) VALUES
(1, 00002312313, 'pepito', 'paloweko', 'xd@gmail.com', 'V', 1, 00003212312, 1),
(2, 00015415841, 'kaldoso', 'muñeko', 'kaldoso@gmail.com', 'H', 5, 00034445555, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedorproducto`
--

CREATE TABLE `proveedorproducto` (
  `id` int(10) NOT NULL,
  `proveedor` int(10) NOT NULL,
  `producto` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedorproducto`
--

INSERT INTO `proveedorproducto` (`id`, `proveedor`, `producto`) VALUES
(1, 2, 2),
(2, 1, 2),
(5, 2, 4),
(6, 2, 5),
(7, 1, 4),
(8, 1, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `respaldo`
--

CREATE TABLE `respaldo` (
  `id` int(10) NOT NULL,
  `ruta` varchar(60) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salidaproductos`
--

CREATE TABLE `salidaproductos` (
  `id` int(20) NOT NULL,
  `CantidadSalida` int(20) NOT NULL,
  `ProductoSalida` int(20) NOT NULL,
  `FacturaSalida` int(20) NOT NULL,
  `EstadoSalida` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `salidaproductos`
--

INSERT INTO `salidaproductos` (`id`, `CantidadSalida`, `ProductoSalida`, `FacturaSalida`, `EstadoSalida`) VALUES
(1, 6, 2, 81, 1),
(2, 2, 2, 81, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(10) NOT NULL,
  `nombres` varchar(40) NOT NULL,
  `apellidos` varchar(40) NOT NULL,
  `cedula` int(9) NOT NULL,
  `tlf` int(11) UNSIGNED ZEROFILL NOT NULL,
  `nickname` varchar(40) NOT NULL,
  `clave` varchar(40) NOT NULL,
  `nivel` int(1) NOT NULL,
  `estado` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombres`, `apellidos`, `cedula`, `tlf`, `nickname`, `clave`, `nivel`, `estado`) VALUES
(1, 'pepito', 'jimenes', 24052156, 04125555666, 'pepito123', 'claveprueba', 1, 1),
(2, 'jose', 'gil', 28393154, 04294967295, 'jose', 'pruebaclave', 2, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario` (`usuario`);

--
-- Indices de la tabla `carritocompra`
--
ALTER TABLE `carritocompra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario` (`usuarioCarrito`),
  ADD KEY `producto` (`productoCarrito`),
  ADD KEY `proveedor` (`proveedorCarrito`);

--
-- Indices de la tabla `carritofactura`
--
ALTER TABLE `carritofactura`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario` (`usuario`),
  ADD KEY `producto` (`productoCarrito`),
  ADD KEY `cliente` (`clienteCarrito`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `composicion`
--
ALTER TABLE `composicion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idproducto` (`producto`),
  ADD KEY `idmateria` (`materia`);

--
-- Indices de la tabla `compra`
--
ALTER TABLE `compra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario` (`usuario`),
  ADD KEY `proveedor` (`proveedor`);

--
-- Indices de la tabla `detallescompra`
--
ALTER TABLE `detallescompra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `compra` (`compra`),
  ADD KEY `producto` (`producto`);

--
-- Indices de la tabla `detallesfactura`
--
ALTER TABLE `detallesfactura`
  ADD PRIMARY KEY (`id`),
  ADD KEY `factura` (`factura`),
  ADD KEY `producto` (`producto`);

--
-- Indices de la tabla `entradaproductos`
--
ALTER TABLE `entradaproductos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductoEntrada` (`ProductoEntrada`),
  ADD KEY `CompraEntrada` (`CompraEntrada`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario` (`usuario`),
  ADD KEY `cliente` (`cliente`);

--
-- Indices de la tabla `formaspago`
--
ALTER TABLE `formaspago`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `intentosseguridad`
--
ALTER TABLE `intentosseguridad`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario` (`usuario`);

--
-- Indices de la tabla `pagocompra`
--
ALTER TABLE `pagocompra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `compra` (`compra`),
  ADD KEY `forma` (`forma`);

--
-- Indices de la tabla `pagofactura`
--
ALTER TABLE `pagofactura`
  ADD PRIMARY KEY (`id`),
  ADD KEY `factura` (`factura`),
  ADD KEY `forma` (`forma`);

--
-- Indices de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario` (`usuario`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `proveedorproducto`
--
ALTER TABLE `proveedorproducto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proveedor` (`proveedor`),
  ADD KEY `producto` (`producto`);

--
-- Indices de la tabla `respaldo`
--
ALTER TABLE `respaldo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `salidaproductos`
--
ALTER TABLE `salidaproductos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductoSalida` (`ProductoSalida`),
  ADD KEY `FacturaSalida` (`FacturaSalida`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `carritocompra`
--
ALTER TABLE `carritocompra`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de la tabla `carritofactura`
--
ALTER TABLE `carritofactura`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `composicion`
--
ALTER TABLE `composicion`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `compra`
--
ALTER TABLE `compra`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `detallescompra`
--
ALTER TABLE `detallescompra`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT de la tabla `detallesfactura`
--
ALTER TABLE `detallesfactura`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=308;

--
-- AUTO_INCREMENT de la tabla `entradaproductos`
--
ALTER TABLE `entradaproductos`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `factura`
--
ALTER TABLE `factura`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT de la tabla `formaspago`
--
ALTER TABLE `formaspago`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `intentosseguridad`
--
ALTER TABLE `intentosseguridad`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pagocompra`
--
ALTER TABLE `pagocompra`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `pagofactura`
--
ALTER TABLE `pagofactura`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `proveedorproducto`
--
ALTER TABLE `proveedorproducto`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `respaldo`
--
ALTER TABLE `respaldo`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `salidaproductos`
--
ALTER TABLE `salidaproductos`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `carritocompra`
--
ALTER TABLE `carritocompra`
  ADD CONSTRAINT `carritocompra_ibfk_1` FOREIGN KEY (`productoCarrito`) REFERENCES `producto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `carritocompra_ibfk_2` FOREIGN KEY (`proveedorCarrito`) REFERENCES `proveedor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `carritocompra_ibfk_3` FOREIGN KEY (`usuarioCarrito`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `carritofactura`
--
ALTER TABLE `carritofactura`
  ADD CONSTRAINT `carritofactura_ibfk_1` FOREIGN KEY (`clienteCarrito`) REFERENCES `cliente` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `carritofactura_ibfk_2` FOREIGN KEY (`usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `carritofactura_ibfk_3` FOREIGN KEY (`productoCarrito`) REFERENCES `producto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `composicion`
--
ALTER TABLE `composicion`
  ADD CONSTRAINT `composicion_ibfk_1` FOREIGN KEY (`producto`) REFERENCES `producto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `composicion_ibfk_2` FOREIGN KEY (`materia`) REFERENCES `producto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `compra`
--
ALTER TABLE `compra`
  ADD CONSTRAINT `compra_ibfk_1` FOREIGN KEY (`usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `compra_ibfk_2` FOREIGN KEY (`proveedor`) REFERENCES `proveedor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `detallescompra`
--
ALTER TABLE `detallescompra`
  ADD CONSTRAINT `detallescompra_ibfk_1` FOREIGN KEY (`compra`) REFERENCES `compra` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `detallescompra_ibfk_2` FOREIGN KEY (`producto`) REFERENCES `producto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `detallesfactura`
--
ALTER TABLE `detallesfactura`
  ADD CONSTRAINT `detallesfactura_ibfk_1` FOREIGN KEY (`factura`) REFERENCES `factura` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `detallesfactura_ibfk_2` FOREIGN KEY (`producto`) REFERENCES `producto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `entradaproductos`
--
ALTER TABLE `entradaproductos`
  ADD CONSTRAINT `entradaproductos_ibfk_1` FOREIGN KEY (`ProductoEntrada`) REFERENCES `producto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `entradaproductos_ibfk_2` FOREIGN KEY (`CompraEntrada`) REFERENCES `compra` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`cliente`) REFERENCES `cliente` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `pagocompra`
--
ALTER TABLE `pagocompra`
  ADD CONSTRAINT `pagocompra_ibfk_2` FOREIGN KEY (`forma`) REFERENCES `formaspago` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pagocompra_ibfk_3` FOREIGN KEY (`compra`) REFERENCES `compra` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `pagofactura`
--
ALTER TABLE `pagofactura`
  ADD CONSTRAINT `pagofactura_ibfk_1` FOREIGN KEY (`factura`) REFERENCES `factura` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pagofactura_ibfk_2` FOREIGN KEY (`forma`) REFERENCES `formaspago` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD CONSTRAINT `preguntas_ibfk_1` FOREIGN KEY (`usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `proveedorproducto`
--
ALTER TABLE `proveedorproducto`
  ADD CONSTRAINT `proveedorproducto_ibfk_1` FOREIGN KEY (`proveedor`) REFERENCES `proveedor` (`id`),
  ADD CONSTRAINT `proveedorproducto_ibfk_2` FOREIGN KEY (`producto`) REFERENCES `producto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `salidaproductos`
--
ALTER TABLE `salidaproductos`
  ADD CONSTRAINT `salidaproductos_ibfk_1` FOREIGN KEY (`ProductoSalida`) REFERENCES `producto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `salidaproductos_ibfk_2` FOREIGN KEY (`FacturaSalida`) REFERENCES `factura` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
