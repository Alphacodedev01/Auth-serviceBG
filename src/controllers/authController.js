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
    const userCredential = await createUserWithEmailAndPassword(email, password);
    
    // Crear usuario en MongoDB
    const user = new User({
      email,
      nombre,
      cedula,
      edad,
      telefono,
      direccion
    });

    console.log("Guardando usuario en MongoDB...", user);
await user.save();
console.log("Usuario guardado correctamente en MongoDB.");


    return {
      statusCode: 201,
      message: 'Usuario registrado exitosamente',
      user: {
        email,
        nombre
      }
    };
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

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUid = userCredential.user.uid;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Usuario no encontrado'
      });
    }

    return {
      statusCode: 200,
      message: 'Login exitoso',
      user: {
        uid: firebaseUid,
        email: user.email,
        nombre: user.nombre
      }
    };
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

    return {
      statusCode: 200,
      message: 'Correo de restablecimiento enviado'
    };
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
    const { uid } = request.params;
    const user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Usuario no encontrado'
      });
    }

    return {
      statusCode: 200,
      user: {
        email: user.email,
        nombre: user.nombre,
        cedula: user.cedula,
        edad: user.edad,
        telefono: user.telefono,
        direccion: user.direccion
      }
    };
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
