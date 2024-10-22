// Error-handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Default to 500 if statusCode is not set
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack // Hide stack trace in production
    });
};

module.exports = errorHandler;