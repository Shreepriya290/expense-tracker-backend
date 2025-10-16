import { sendError } from '../utils/response.js';
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'ValidationError') return sendError(res, 400, 'Validation Error', err.message);
  if (err.name === 'UnauthorizedError') return sendError(res, 401, 'Unauthorized', err.message);
  if (err.code === '23505') return sendError(res, 409, 'Resource already exists', err.detail);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, statusCode, message, process.env.NODE_ENV === 'development' ? err.stack : null);
};
export const notFound = (req, res, next) => sendError(res, 404, `Route not found - ${req.originalUrl}`);
