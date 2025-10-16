import { supabase } from '../database/supabase.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
export const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) return sendError(res, 409, 'User with this email already exists');
    const hashedPassword = await hashPassword(password);
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          full_name,
        },
      ])
      .select('id, email, full_name, created_at')
      .single();
    if (error) return sendError(res, 500, 'Failed to create user', error.message);
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await supabase
      .from('refresh_tokens')
      .insert([{ user_id: user.id, token: refreshToken }]);

    return sendSuccess(res, 201, 'User registered successfully', {
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    return sendError(res, 500, 'Registration failed', error.message);
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error || !user) return sendError(res, 401, 'Invalid email or password');
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) return sendError(res, 401, 'Invalid email or password');
    const { data: existingTokens } = await supabase
      .from('refresh_tokens')
      .select('token')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    let refreshToken;
    
    if (existingTokens && existingTokens.length > 0) {
      try {
        verifyRefreshToken(existingTokens[0].token);
        refreshToken = existingTokens[0].token;
      } catch (error) {
        await supabase
          .from('refresh_tokens')
          .delete()
          .eq('user_id', user.id);
        refreshToken = generateRefreshToken(user.id);
        await supabase
          .from('refresh_tokens')
          .insert([{ user_id: user.id, token: refreshToken }]);
      }
    } else {
      refreshToken = generateRefreshToken(user.id);
      await supabase
        .from('refresh_tokens')
        .insert([{ user_id: user.id, token: refreshToken }]);
    }
    const accessToken = generateAccessToken(user.id);
    delete user.password;

    return sendSuccess(res, 200, 'Login successful', {
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Login failed', error.message);
  }
};
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) return sendError(res, 400, 'Refresh token is required');
    const decoded = verifyRefreshToken(refreshToken);
    const { data: tokenData, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token', refreshToken)
      .eq('user_id', decoded.userId)
      .single();
    if (error || !tokenData) return sendError(res, 401, 'Invalid refresh token');
    const accessToken = generateAccessToken(decoded.userId);

    return sendSuccess(res, 200, 'Token refreshed successfully', {
      accessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Invalid or expired refresh token');
    }
    return sendError(res, 500, 'Token refresh failed', error.message);
  }
};
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) await supabase.from('refresh_tokens').delete().eq('token', refreshToken);

    return sendSuccess(res, 200, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return sendError(res, 500, 'Logout failed', error.message);
  }
};
export const getProfile = async (req, res) => {
  try {
    return sendSuccess(res, 200, 'Profile fetched successfully', {
      user: req.user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, 500, 'Failed to fetch profile', error.message);
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { full_name } = req.body;
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .update({ full_name })
      .eq('id', userId)
      .select('id, email, full_name, created_at')
      .single();

    if (error) return sendError(res, 500, 'Failed to update profile', error.message);

    return sendSuccess(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 500, 'Failed to update profile', error.message);
  }
};
