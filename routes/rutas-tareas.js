const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");
const Tarea = require("../models/tareas-model");
const Usuario = require("../models/usuarios-model");

router.use(checkAuth);

router.post("/", async (req, res, next) => {
  const {
    titulo,
    descripcion,
    categoria,
    fechaCreacion,
    fechaExpiracion,
    usuario,
  } = req.body;
  let existeTarea;
  try {
    existeTarea = await Tarea.findOne({ titulo: titulo });
  } catch (err) {
    const error = new Error("Error en la comprobación.");
    error.code = 500;
    return next(error);
  }

  if (existeTarea) {
    const error = new Error("Ya existe una tarea con ese titulo");
    error.code = 401;
    return next(error);
  } else {
    const nuevaTarea = new Tarea({
      titulo,
      descripcion,
      categoria,
      fechaCreacion,
      fechaExpiracion,
      usuario,
    });
    let usuarioBusca;
    try {
      usuarioBusca = await Usuario.findById(req.body.usuario);
    } catch (error) {
      const err = new Error("Ha fallado la operación de creación.");
      err.code = 500;
      return next(err);
    }
    if (!usuarioBusca) {
      const error = new Error(
        "No se ha podido encontrar un usuario con ese id"
      );
      error.code = 404;
      return next(error);
    }

    try {
      await nuevaTarea.save();
      usuarioBusca.tareas.push(nuevaTarea);
      await usuarioBusca.save();
    } catch (error) {
      const err = new Error("Error al guardar la tarea");
      err.code = 500;
      return next(err);
    }
    res.status(201).json({
      tarea: nuevaTarea,
    });
  }
});

router.get("/", async (req, res, next) => {
  let tareas;
  try {
    tareas = await Tarea.find({}).populate("usuario");
  } catch (err) {
    const error = new Error(
      "Error. No se han podido recuperar los datos de las tareas."
    );
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Todas las tareas:",
    tareas: tareas,
  });
});

router.get("/usuario/:id", async (req, res, next) => {
  const idUsuario = req.params.id;
  let tareasUsuario;
  try {
    tareasUsuario = await Tarea.find({ usuario: idUsuario }).populate(
      "usuario"
    );
  } catch (err) {
    const error = new Error("Error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Todas las tareas del usuario:",
    tareas: tareasUsuario,
  });
});

router.get("/:id", async (req, res, next) => {
  let tarea;
  const idTarea = req.params.id;
  try {
    tarea = await Tarea.findById(idTarea);
  } catch (err) {
    const error = new Error("Error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  if (!tarea) {
    const error = new Error("No se ha encontrado la tarea.");
    error.code = 404;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Tarea:",
    tarea: tarea,
  });
});

router.get("/usuario/:id", async (req, res, next) => {
  const idUsuario = req.params.id;
  let tareasUsuario;
  try {
    tareasUsuario = await Tarea.find({ usuario: idUsuario }).populate(
      "usuario"
    );
  } catch (err) {
    const error = new Error("Error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Todas las tareas del usuario:",
    tareas: tareasUsuario,
  });
});

router.patch("/:id", async (req, res, next) => {
  let tareaModificar;
  try {
    tareaModificar = await Tarea.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("usuario");
  } catch (err) {
    res.status(404).json({
      mensaje: "No se han podido actualizar los datos",
      error: err.message,
    });
  }
  res.status(200).json({
    mensaje: "Datos de tarea modificados",
    tarea: tareaModificar,
  });
});

router.delete("/:id", async (req, res, next) => {
  let tareaBorrar;
  try {
    tareaBorrar = await Tarea.findByIdAndDelete(req.params.id).populate(
      "usuario"
    );
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!tareaBorrar) {
    const error = new Error(
      "No se ha podido encontrar una tarea con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  try {
    tareaBorrar.usuario.tareas.pull(tareaBorrar);
    await tareaBorrar.usuario.save();
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    mensaje: "Tarea borrada",
    tarea: tareaBorrar,
  });
});

module.exports = router;
