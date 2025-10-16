export const CATEGORIES = [
  {
    id: 'food-dining',
    name: 'Food & Dining',
    icon: 'UtensilsCrossed',
    color: '#ef4444',
    type: 'expense'
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: 'Car',
    color: '#f59e0b',
    type: 'expense'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#ec4899',
    type: 'expense'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#8b5cf6',
    type: 'expense'
  },
  {
    id: 'bills-utilities',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#06b6d4',
    type: 'expense'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'HeartPulse',
    color: '#10b981',
    type: 'expense'
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    color: '#3b82f6',
    type: 'expense'
  },
  {
    id: 'salary',
    name: 'Salary',
    icon: 'Wallet',
    color: '#22c55e',
    type: 'income'
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'Package',
    color: '#6b7280',
    type: 'expense'
  }
];
export const getAllCategories = () => CATEGORIES;
