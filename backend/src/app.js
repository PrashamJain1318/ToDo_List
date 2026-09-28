const express = require('express');
const cors = require('cors');
const path = require('path');

const todoRoutes = require('./routes/todo.routes');
const notFound = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'TaskFlow API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/todos', todoRoutes);

// Catch-all for single-page frontend when accessing root or paths
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 404 Handler for API routes
app.use(notFound);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
