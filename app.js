const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // CORS middleware for cross-origin requests
const discountRoutes = require('./src/routes/discount');
const errorHandler = require('./src/middleware/errorHandler');

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Discount calculation routes
app.use('/api/calculate-discount', discountRoutes);

// Error-handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
