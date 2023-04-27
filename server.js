const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const rutasUsuarios = require("./routes/rutas-usuarios");
app.use("/api/usuarios", rutasUsuarios);

const rutasTareas = require("./routes/rutas-tareas");
app.use("/api/mistareas", rutasTareas);

app.use((req, res) => {
  res.status(404);
  res.json({
    mensaje: "Información no encontrada",
  });
});

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    app.listen(process.env.PORT, () => console.log("Escuchando..."));
  })
  .catch((error) => console.log(error));
