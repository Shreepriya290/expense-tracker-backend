import { supabase } from '../database/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
export const createExpense = async (req, res) => {
  try {
    const { amount, category, description, date, payment_method, tags } = req.body;
    const userId = req.user.id;

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([
        {
          user_id: userId,
          amount,
          category,
          description,
          date,
          payment_method,
          tags,
        },
      ])
      .select()
      .single();

    if (error) return sendError(res, 500, 'Failed to create expense', error.message);

    return sendSuccess(res, 201, 'Expense created successfully', { expense });
  } catch (error) {
    console.error('Create expense error:', error);
    return sendError(res, 500, 'Failed to create expense', error.message);
  }
};
export const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      category, 
      startDate, 
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    if (category) {
      query = query.eq('category', category);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    if (minAmount) {
      query = query.gte('amount', parseFloat(minAmount));
    }

    if (maxAmount) {
      query = query.lte('amount', parseFloat(maxAmount));
    }

    if (search) {
      query = query.ilike('description', `%${search}%`);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data: expenses, error, count } = await query;

    if (error) return sendError(res, 500, 'Failed to fetch expenses', error.message);

    return sendSuccess(res, 200, 'Expenses fetched successfully', {
      expenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    return sendError(res, 500, 'Failed to fetch expenses', error.message);
  }
};
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: expense, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !expense) return sendError(res, 404, 'Expense not found');

    return sendSuccess(res, 200, 'Expense fetched successfully', { expense });
  } catch (error) {
    console.error('Get expense error:', error);
    return sendError(res, 500, 'Failed to fetch expense', error.message);
  }
};
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, category, description, date, payment_method, tags } = req.body;

    const { data: existingExpense } = await supabase
      .from('expenses')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (!existingExpense) return sendError(res, 404, 'Expense not found');

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        amount,
        category,
        description,
        date,
        payment_method,
        tags,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return sendError(res, 500, 'Failed to update expense', error.message);

    return sendSuccess(res, 200, 'Expense updated successfully', { expense });
  } catch (error) {
    console.error('Update expense error:', error);
    return sendError(res, 500, 'Failed to update expense', error.message);
  }
};
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: existingExpense } = await supabase
      .from('expenses')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (!existingExpense) return sendError(res, 404, 'Expense not found');

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) return sendError(res, 500, 'Failed to delete expense', error.message);

    return sendSuccess(res, 200, 'Expense deleted successfully');
  } catch (error) {
    console.error('Delete expense error:', error);
    return sendError(res, 500, 'Failed to delete expense', error.message);
  }
};
export const getExpenseStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('expenses')
      .select('amount, category, date')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: expenses, error } = await query;

    if (error) return sendError(res, 500, 'Failed to fetch expense statistics', error.message);

    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    
    const categoryTotals = {};
    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += parseFloat(expense.amount);
    });
    
    const monthlyTotals = {};
    expenses.forEach(expense => {
      const month = expense.date.substring(0, 7); // YYYY-MM
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
      }
      monthlyTotals[month] += parseFloat(expense.amount);
    });

    return sendSuccess(res, 200, 'Statistics fetched successfully', {
      totalExpenses,
      avgExpense,
      expenseCount: expenses.length,
      categoryBreakdown: categoryTotals,
      monthlyBreakdown: monthlyTotals,
    });
  } catch (error) {
    console.error('Get expense stats error:', error);
    return sendError(res, 500, 'Failed to fetch expense statistics', error.message);
  }
};
