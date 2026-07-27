const rateLimit = require('express-rate-limit');

// Login limiter - prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Demasiados intentos de inicio de sesión. Por favor, intentá de nuevo en 15 minutos.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Register limiter - prevent mass account creation
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 registrations per windowMs
  message: 'Demasiados registros desde esta IP. Por favor, intentá de nuevo en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

// DNI search limiter - prevent student enumeration
const dniSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 DNI searches per windowMs
  message: 'Demasiadas búsquedas. Por favor, intentá de nuevo en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Demasiadas solicitudes. Por favor, intentá de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, registerLimiter, dniSearchLimiter, apiLimiter };
