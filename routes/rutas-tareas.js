const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");
const Tarea = require("../models/tareas-model");
const Usuario = require("../models/usuarios-model");

router.use(checkAuth);

router.post("/", async (req, res, next) => {
  const { titulo, descripcion, categoria, fechaCreacion, fechaExpiracion } =
    req.body;
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
    });
    try {
      await nuevaTarea.save();
    } catch (error) {
      const err = new Error("Error al guardar la tarea");
      err.code = 500;
      return next(err);
    }
    res.status(201).json({
      mensaje: "Tarea creada",
      tareaId: nuevaTarea.id,
      titulo: nuevaTarea.titulo,
      descripcion: nuevaTarea.descripcion,
      categoria: nuevaTarea.categoria,
      fechaCreacion: nuevaTarea.fechaCreacion,
      fechaExpiracion: nuevaTarea.fechaExpiracion,
    });
  }
});

router.get("/", async (req, res, next) => {
  let tareas;
  try {
    tareas = await Tarea.find({});
  } catch (err) {
    const error = new Error(
      "Error. No se han podido recuperar los datos de las tareas."
    );
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Todos los tareas:",
    tareas: tareas,
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

router.patch("/:id", async (req, res, next) => {
  let tareaModificar;
  let idTarea = req.params.id;
  try {
    tareaModificar = await Tarea.findByIdAndUpdate(idTarea, req.body, {
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
    mensaje: "Datos de tarea modificados",
    tarea: tareaModificar,
  });
});

router.delete("/:id", async (req, res, next) => {
  let tareaBorrar;
  try {
    tareaBorrar = await Tarea.findByIdAndDelete(req.params.id);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!tarea) {
    const error = new Error(
      "No se ha podido encontrar una tarea con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  try {
    await tarea.deleteOne();

    tarea.usuario.tareas.pull(tarea);
    await tarea.usuario.save();
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
