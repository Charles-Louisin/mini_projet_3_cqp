const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectToDatabase } = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database
connectToDatabase();

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/admin', require('./routes/admin'));

// Swagger docs
const swaggerUi = require('swagger-ui-express');
const openapi = require('./docs/openapi.json');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Global error handler
// Note: keep 4 args to signal Express error middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Basic error formatting
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on port ${PORT}`);
});


