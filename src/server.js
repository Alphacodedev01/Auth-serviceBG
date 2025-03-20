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
  credentials: true
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
    
    // En Vercel, no necesitamos escuchar en un puerto específico
    if (process.env.VERCEL) {
      console.log('Running on Vercel, skipping listen');
      return;
    }

    // Para desarrollo local
    const port = process.env.PORT || 3001;
    await fastify.listen({ 
      port, 
      host: '0.0.0.0' 
    });
    console.log(`Servidor iniciado en puerto ${port}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

// Exportar para Vercel
exports.default = async (req, res) => {
  await fastify.ready();
  fastify.server.emit('request', req, res);
};

// Iniciar servidor si no estamos en Vercel
if (!process.env.VERCEL) {
  start();
}
