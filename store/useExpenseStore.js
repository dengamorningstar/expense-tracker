import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEMES = {
  light: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#2D3436',
    subText: '#636E72',
    accent: '#6C5CE7',
    inputBg: '#FFFFFF',
    border: '#DFE6E9',
    rowBg: '#FFFFFF',
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    subText: '#A0A0A0',
    accent: '#BB86FC',
    inputBg: '#2C2C2C',
    border: '#333333',
    rowBg: '#1E1E1E',
  },
};

const CURRENCY_SYMBOLS = {
  KES: 'KSh ',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const useExpenseStore = create(
  persist(
    (set, get) => ({
      // Initial State
      expenses: [
        { id: '1', title: 'Groceries', amount: 3500, category: 'Shopping', date: new Date().toISOString() },
        { id: '2', title: 'Transport', amount: 200, category: 'Transport', date: new Date().toISOString() },
      ],
      theme: 'light',
      currency: 'KES',
      monthlyBudget: 0,

      // Actions
      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              ...expense,
            },
            ...state.expenses,
          ],
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((item) => String(item.id) !== String(id)),
        })),

      editExpense: (id, updatedData) =>
        set((state) => ({
          expenses: state.expenses.map((item) =>
            String(item.id) === String(id) ? { ...item, ...updatedData } : item
          ),
        })),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      changeCurrency: (newCurrency) => set({ currency: newCurrency }),

      updateMonthlyBudget: (newBudget) => set({ monthlyBudget: newBudget }),

      // Helpers
      formatAmount: (amount) => {
        const symbol = CURRENCY_SYMBOLS[get().currency] || '';
        const num = Number(amount || 0);
        return `${symbol}${num.toLocaleString()}`;
      },
    }),
    {
      name: 'expense-tracker-storage', // Unique key in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);