/**
 * Request Logger Middleware
 * Logs all incoming requests for debugging and monitoring
 */

import { config } from '../config/index.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  const originalSend = res.send.bind(res);
  
  res.send = function(body) {
    const duration = Date.now() - start;
    
    if (config.nodeEnv === 'development') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
    
    return originalSend(body);
  };
  
  next();
};

export default requestLogger;
