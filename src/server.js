require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const connectDB = require('./config/database');

// Conectar a MongoDB
connectDB();

// Configurar CORS
fastify.register(cors, {
  origin: true
});

// Registrar rutas
fastify.register(require('./routes/auth'), { prefix: '/auth' });

// Ruta de salud
fastify.get('/health', async () => {
  return {
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  };
});

const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Servidor iniciado en puerto ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
