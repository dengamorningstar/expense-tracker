import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@expense_tracker_items';
const INITIAL_BUDGET = 20000;

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load items on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        setExpenses(JSON.parse(jsonValue));
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load expenses.');
    } finally {
      setIsLoading(false);
    }
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
      amount,
      category,
      date: new Date().toLocaleDateString(),
    };
    saveExpenses([newExpense, ...expenses]);
  };

  const updateExpense = (id, updatedTitle, updatedAmount, updatedCategory) => {
    const updatedList = expenses.map((item) =>
      item.id === id
        ? { ...item, title: updatedTitle, amount: updatedAmount, category: updatedCategory }
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

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const currentBalance = INITIAL_BUDGET - totalSpent;

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
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
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}