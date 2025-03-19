const {
  register,
  login,
  resetPassword,
  getUserProfile
} = require('../controllers/authController');

const registerSchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'nombre', 'cedula', 'edad', 'telefono', 'direccion'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      nombre: { type: 'string' },
      cedula: { type: 'string' },
      edad: { type: 'number' },
      telefono: { type: 'string' },
      direccion: { type: 'string' }
    }
  }
};

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' }
    }
  }
};

const resetPasswordSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' }
    }
  }
};

async function routes(fastify, options) {
  fastify.post('/register', { schema: registerSchema }, register);
  fastify.post('/login', { schema: loginSchema }, login);
  fastify.post('/reset-password', { schema: resetPasswordSchema }, resetPassword);
  fastify.get('/profile/:uid', getUserProfile);
}

module.exports = routes;
