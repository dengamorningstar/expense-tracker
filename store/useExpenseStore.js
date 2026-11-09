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

// Exchange rates relative to base currency (KES)
const EXCHANGE_RATES = {
  KES: 1,
  USD: 0.0077, // 1 KES ≈ 0.0077 USD (1 USD ≈ 130 KES)
  EUR: 0.0071, // 1 KES ≈ 0.0071 EUR (1 EUR ≈ 140 KES)
  GBP: 0.0061, // 1 KES ≈ 0.0061 GBP (1 GBP ≈ 163 KES)
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

      // Dynamic Currency Conversion Helper
      formatAmount: (amount) => {
        const rawNum = Number(amount || 0);
        const currentCurrency = get().currency || 'KES';
        
        const rate = EXCHANGE_RATES[currentCurrency] || 1;
        const symbol = CURRENCY_SYMBOLS[currentCurrency] || '';

        // Calculate converted amount
        const converted = rawNum * rate;

        // KES displays rounded whole numbers; foreign currencies show 2 decimal places
        const formattedNumber = currentCurrency === 'KES'
          ? Math.round(converted).toLocaleString()
          : converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        return `${symbol}${formattedNumber}`;
      },
    }),
    {
      name: 'expense-tracker-storage', // Unique key in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);