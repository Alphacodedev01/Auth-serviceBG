require('dotenv').config();
const fastify = require('fastify')({ 
  logger: true,
  trustProxy: true
});
const cors = require('@fastify/cors');
const connectDB = require('./config/database');

// Error handler
fastify.setErrorHandler(function (error, request, reply) {
  console.error('Error:', error);
  reply.status(500).send({
    status: 'error',
    message: error.message || 'Internal Server Error',
    error: error.name || 'UnknownError'
  });
});

// Configurar CORS
fastify.register(cors, {
  origin: ['https://api-gateway-bg.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Ruta raíz
fastify.get('/', async () => {
  return {
    status: 'ok',
    service: 'BeautiGo Auth Service',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        register: '/auth/register [POST]',
        login: '/auth/login [POST]',
        resetPassword: '/auth/reset-password [POST]',
        profile: '/auth/profile/:uid [GET]'
      }
    }
  };
});

// Registrar rutas
fastify.register(require('./routes/auth'), { prefix: '/auth' });

// Ruta de salud
fastify.get('/health', async () => {
  return {
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      mongoConnected: !!fastify.mongo
    }
  };
});

const start = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();
    
    // Para desarrollo local
    if (!process.env.VERCEL) {
      const port = process.env.PORT || 3001;
      await fastify.listen({ 
        port, 
        host: '0.0.0.0' 
      });
      console.log(`Servidor iniciado en puerto ${port}`);
    }
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

// Exportar para Vercel
module.exports = async (req, res) => {
  await fastify.ready();
  fastify.server.emit('request', req, res);
};

// Iniciar servidor si no estamos en Vercel
if (!process.env.VERCEL) {
  start();
}
