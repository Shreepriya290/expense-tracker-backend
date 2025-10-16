import { supabase } from '../database/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
export const createBudget = async (req, res) => {
  try {
    const { category, amount, period, start_date, end_date } = req.body;
    const userId = req.user.id;

    const { data: budget, error } = await supabase
      .from('budgets')
      .insert([
        {
          user_id: userId,
          category,
          amount,
          period,
          start_date,
          end_date,
        },
      ])
      .select()
      .single();

    if (error) return sendError(res, 500, 'Failed to create budget', error.message);

    return sendSuccess(res, 201, 'Budget created successfully', { budget });
  } catch (error) {
    console.error('Create budget error:', error);
    return sendError(res, 500, 'Failed to create budget', error.message);
  }
};
export const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { active } = req.query;

    let query = supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (active === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query = query.lte('start_date', today).gte('end_date', today);
    }

    const { data: budgets, error } = await query.order('created_at', { ascending: false });

    if (error) return sendError(res, 500, 'Failed to fetch budgets', error.message);

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', userId)
          .eq('category', budget.category)
          .gte('date', budget.start_date)
          .lte('date', budget.end_date);

        const spent = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0;
        const remaining = parseFloat(budget.amount) - spent;
        const percentageUsed = (spent / parseFloat(budget.amount)) * 100;

        return {
          ...budget,
          spent,
          remaining,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
        };
      })
    );

    return sendSuccess(res, 200, 'Budgets fetched successfully', { budgets: budgetsWithSpent });
  } catch (error) {
    console.error('Get budgets error:', error);
    return sendError(res, 500, 'Failed to fetch budgets', error.message);
  }
};
export const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: budget, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !budget) return sendError(res, 404, 'Budget not found');

    // Calculate spent amount
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .eq('category', budget.category)
      .gte('date', budget.start_date)
      .lte('date', budget.end_date);

    const spent = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0;
    const remaining = parseFloat(budget.amount) - spent;
    const percentageUsed = (spent / parseFloat(budget.amount)) * 100;

    const budgetWithSpent = {
      ...budget,
      spent,
      remaining,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
    };

    return sendSuccess(res, 200, 'Budget fetched successfully', { budget: budgetWithSpent });
  } catch (error) {
    console.error('Get budget error:', error);
    return sendError(res, 500, 'Failed to fetch budget', error.message);
  }
};
export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { category, amount, period, start_date, end_date } = req.body;

    const { data: existingBudget } = await supabase
      .from('budgets')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (!existingBudget) return sendError(res, 404, 'Budget not found');

    const { data: budget, error } = await supabase
      .from('budgets')
      .update({
        category,
        amount,
        period,
        start_date,
        end_date,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return sendError(res, 500, 'Failed to update budget', error.message);

    return sendSuccess(res, 200, 'Budget updated successfully', { budget });
  } catch (error) {
    console.error('Update budget error:', error);
    return sendError(res, 500, 'Failed to update budget', error.message);
  }
};
export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: existingBudget } = await supabase
      .from('budgets')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (!existingBudget) return sendError(res, 404, 'Budget not found');

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) return sendError(res, 500, 'Failed to delete budget', error.message);

    return sendSuccess(res, 200, 'Budget deleted successfully');
  } catch (error) {
    console.error('Delete budget error:', error);
    return sendError(res, 500, 'Failed to delete budget', error.message);
  }
};
