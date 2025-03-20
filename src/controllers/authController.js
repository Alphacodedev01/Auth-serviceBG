const { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} = require('firebase/auth');
const { auth } = require('../config/firebase');
const User = require('../models/User');

const register = async (request, reply) => {
  try {
    const { email, password, nombre, cedula, edad, telefono, direccion } = request.body;

    // Crear usuario en Firebase
    await createUserWithEmailAndPassword(auth, email, password);

    // Guardar usuario en MongoDB sin el UID de Firebase
    const user = new User({
      email,
      nombre,
      cedula,
      edad,
      telefono,
      direccion
    });

    await user.save();

    return reply.code(201).send({
      statusCode: 201,
      message: 'Usuario registrado exitosamente',
      user: {
        email,
        nombre
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return reply.code(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error.message
    });
  }
};

const login = async (request, reply) => {
  try {
    const { email, password } = request.body;

    await signInWithEmailAndPassword(auth, email, password);

    const user = await User.findOne({ email });

    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Usuario no encontrado'
      });
    }

    return reply.code(200).send({
      statusCode: 200,
      message: 'Login exitoso',
      user: {
        email: user.email,
        nombre: user.nombre
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return reply.code(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Credenciales inválidas'
    });
  }
};

const resetPassword = async (request, reply) => {
  try {
    const { email } = request.body;
    await sendPasswordResetEmail(auth, email);

    return reply.code(200).send({
      statusCode: 200,
      message: 'Correo de restablecimiento enviado'
    });
  } catch (error) {
    console.error('Error en reset password:', error);
    return reply.code(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error.message
    });
  }
};

const getUserProfile = async (request, reply) => {
  try {
    const { email } = request.params;
    const user = await User.findOne({ email });

    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Usuario no encontrado'
      });
    }

    return reply.code(200).send({
      statusCode: 200,
      user: {
        email: user.email,
        nombre: user.nombre,
        cedula: user.cedula,
        edad: user.edad,
        telefono: user.telefono,
        direccion: user.direccion
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Error al obtener el perfil del usuario'
    });
  }
};

module.exports = {
  register,
  login,
  resetPassword,
  getUserProfile
};
