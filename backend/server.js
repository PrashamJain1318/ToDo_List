require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

let PORT = parseInt(process.env.PORT, 10) || 5001;

// Initialize Database and Start Server
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const listenOnPort = (port) => {
    const server = app.listen(port, () => {
      console.log(`
======================================================
🚀 TaskFlow Server is running!
📡 Web App: http://localhost:${port}
📚 REST API: http://localhost:${port}/api/todos
💚 Health Check: http://localhost:${port}/api/health
======================================================
      `);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${port} is in use. Trying port ${port + 1}...`);
        listenOnPort(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n🛑 Gracefully shutting down TaskFlow server...');
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  };

  listenOnPort(PORT);
};

startServer();
