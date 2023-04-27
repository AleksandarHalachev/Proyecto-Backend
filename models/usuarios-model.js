const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  tareas: [{ type: mongoose.Types.ObjectId, ref: "Tarea" }],
});

module.exports = mongoose.model("Usuario", usuarioSchema);
