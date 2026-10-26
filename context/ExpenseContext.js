import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, CURRENCY_SYMBOLS } from '../constants/theme';

const STORAGE_KEY = '@expense_tracker_items';
const THEME_KEY = '@expense_tracker_theme';
const CURRENCY_KEY = '@expense_tracker_currency';
const INITIAL_BUDGET = 200000;

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [theme, setTheme] = useState('light');
  const [currency, setCurrency] = useState('KES');
  const [rates, setRates] = useState({ KES: 1, USD: 0.0077, EUR: 0.0071, GBP: 0.0061 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
    fetchExchangeRates();
  }, []);

  const loadInitialData = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      const savedCurrency = await AsyncStorage.getItem(CURRENCY_KEY);

      if (savedExpenses !== null) setExpenses(JSON.parse(savedExpenses));
      if (savedTheme !== null) setTheme(savedTheme);
      if (savedCurrency !== null) setCurrency(savedCurrency);
    } catch (e) {
      Alert.alert('Error', 'Failed to load app settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/KES');
      const data = await response.json();
      if (data && data.rates) {
        setRates(data.rates);
      }
    } catch (error) {
      console.log('Using default fallback exchange rates.');
    }
  };

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    await AsyncStorage.setItem(THEME_KEY, nextTheme);
  };

  const changeCurrency = async (newCurrency) => {
    setCurrency(newCurrency);
    await AsyncStorage.setItem(CURRENCY_KEY, newCurrency);
  };

  // Convert and format amounts safely against NaN
  const formatAmount = (amountInKes) => {
    const numericAmount = Number(amountInKes) || 0;
    const rate = Number(rates[currency]) || 1;
    const converted = numericAmount * rate;
    const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
    return `${symbol}${converted.toFixed(2)}`;
  };

  const saveExpenses = async (newList) => {
    setExpenses(newList);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      Alert.alert('Error', 'Failed to save expense.');
    }
  };

  const addExpense = (title, amount, category = 'General') => {
    const newExpense = {
      id: Date.now().toString(),
      title,
      amount: Number(amount) || 0,
      category,
      date: new Date().toLocaleDateString(),
    };
    saveExpenses([newExpense, ...expenses]);
  };

  const updateExpense = (id, updatedTitle, updatedAmount, updatedCategory) => {
    const updatedList = expenses.map((item) =>
      item.id === id
        ? { 
            ...item, 
            title: updatedTitle, 
            amount: Number(updatedAmount) || 0, 
            category: updatedCategory 
          }
        : item
    );
    saveExpenses(updatedList);
  };

  const deleteExpense = (id) => {
    Alert.alert('Delete Expense', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => saveExpenses(expenses.filter((item) => item.id !== id)),
      },
    ]);
  };

  // Ensure every item amount is evaluated as a number
  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const currentBalance = INITIAL_BUDGET - totalSpent;

  const currentTheme = themes[theme] || themes.light;

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        theme,
        currentTheme,
        toggleTheme,
        currency,
        changeCurrency,
        formatAmount,
        currentBalance,
        totalSpent,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  return useContext(ExpenseContext);
}