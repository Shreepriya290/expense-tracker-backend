import { verifyAccessToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import { supabase } from '../database/supabase.js';
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return sendError(res, 401, 'Access token is required');
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, created_at')
      .eq('id', decoded.userId)
      .single();
    if (error || !user) return sendError(res, 401, 'Invalid token or user not found');
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return sendError(res, 401, 'Invalid token');
    if (error.name === 'TokenExpiredError') return sendError(res, 401, 'Token expired');
    return sendError(res, 500, 'Authentication failed', error.message);
  }
};
