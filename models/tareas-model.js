const mongoose = require("mongoose");

const tareaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  categoria: {
    type: String,
    enum: ["Personal", "Trabajo", "Otros"],
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
    required: true,
  },
  fechaExpiracion: {
    type: Date,
  },
  usuario: { type: mongoose.Types.ObjectId, ref: "Usuario" },
});

module.exports = mongoose.model("Tarea", tareaSchema);
