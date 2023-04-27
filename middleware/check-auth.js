const jwt = require("jsonwebtoken");

const autorizacion = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("No se ha recibido el token");
    }
    decodedTOKEN = jwt.verify(token, process.env.JWT_KEY);
    req.userData = {
      userID: decodedTOKEN.userId,
      nombre: decodedTOKEN.nombre,
      email: decodedTOKEN.email,
    };
    next();
  } catch (err) {
    const error = new Error("Fallo de autenticación");
    error.code = 401;
    return next(error);
  }
};

module.exports = autorizacion;
