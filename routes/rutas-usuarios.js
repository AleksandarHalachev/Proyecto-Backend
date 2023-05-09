const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");
const Usuario = require("../models/usuarios-model");

router.post("/", async (req, res, next) => {
  const { nombre, email, password } = req.body;
  let existeUsuario;
  try {
    existeUsuario = await Usuario.findOne({ email: email });
  } catch (err) {
    const error = new Error("Error en la búsqueda de usuario.");
    error.code = 500;
    return next(error);
  }

  if (existeUsuario) {
    const error = new Error("Ya existe un usuario con ese email");
    error.code = 401;
    return next(error);
  } else {
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
      const err = new Error("Error en la encripción de la contraseña");
      err.code = 500;
      return next(err);
    }
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      tareas: [],
    });
    try {
      await nuevoUsuario.save();
    } catch (error) {
      const err = new Error("Error al guardar el usuario");
      err.code = 500;
      return next(err);
    }
    res.status(201).json({
      mensaje: "Usuario creado",
      userId: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      tareas: nuevoUsuario.tareas,
      token: token,
    });
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  let usuarioExiste;
  try {
    usuarioExiste = await Usuario.findOne({ email: email });
  } catch (err) {
    const error = new Error("No se puede realizar la operación");
    error.code = 500;
    return next(error);
  }

  if (!usuarioExiste) {
    const error = new Error("Email no existe");
    error.code = 422;
    return next(error);
  }

  let passwordValido = false;
  passwordValido = bcrypt.compareSync(password, usuarioExiste.password);
  if (!passwordValido) {
    const error = new Error("Contraseña incorrecta");
    error.code = 401;
    return next(error);
  }

  let token;
  try {
    token = await jwt.sign(
      {
        userId: usuarioExiste.id,
        nombre: usuarioExiste.nombre,
        email: usuarioExiste.email,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new Error("No se puede realizar la operación");
    error.code = 500;
    return next(error);
  }
  res.json({
    mensaje: "Usuario autenticado",
    userId: usuarioExiste.id,
    email: usuarioExiste.email,
    nombre: usuarioExiste.nombre,
    token: token,
  });
});

router.use(checkAuth);

router.get("/", async (req, res, next) => {
  let usuarios;
  try {
    usuarios = await Usuario.find({}, "-password").populate("tareas");
  } catch (err) {
    const error = new Error(
      "Error. No se han podido recuperar los datos de los usuarios."
    );
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Todos los usuarios:",
    usuarios: usuarios,
  });
});

router.get("/:id", async (req, res, next) => {
  let usuario;
  const idUsuario = req.params.id;
  try {
    usuario = await Usuario.findById(idUsuario).populate("tareas");
  } catch (err) {
    const error = new Error("Error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  if (!usuario) {
    const error = new Error("No se ha encontrado el usuario");
    error.code = 404;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Usuario:",
    usuario: usuario,
  });
});

router.patch("/:id", async (req, res, next) => {
  let usuarioModificar;
  let idUsuario = req.params.id;
  try {
    usuarioModificar = await Usuario.findByIdAndUpdate(idUsuario, req.body, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    res.status(404).json({
      mensaje: "No se han podido actualizar los datos",
      error: err.message,
    });
  }
  res.status(200).json({
    mensaje: "Datos de usuario modificados",
    usuario: usuarioModificar,
  });
});

router.delete("/:id", async (req, res, next) => {
  let usuarioBorrar;
  try {
    usuarioBorrar = await Usuario.findByIdAndDelete(req.params.id);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    mensaje: "Usuario borrado",
    usuario: usuarioBorrar,
  });
});

module.exports = router;
