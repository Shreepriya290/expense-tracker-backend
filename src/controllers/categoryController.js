import { sendSuccess, sendError } from '../utils/response.js';
import { getAllCategories } from '../constants/categories.js';
export const getCategories = async (req, res) => {
  try {
    const categories = getAllCategories();
    return sendSuccess(res, 200, 'Categories fetched successfully', { categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return sendError(res, 500, 'Failed to fetch categories', error.message);
  }
};
