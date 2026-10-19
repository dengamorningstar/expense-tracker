import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import BalanceCard from './components/BalanceCard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseRow from './components/ExpenseRow';

export default function App() {
  const [expenses, setExpenses] = useState([
    { id: '1', title: 'Groceries', amount: 4500 },
    { id: '2', title: 'Internet', amount: 3000 },
  ]);

  const initialBudget = 20000;
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const currentBalance = initialBudget - totalSpent;

  const addExpense = (title, amount) => {
    const newExpense = {
      id: Math.random().toString(),
      title,
      amount,
    };
    setExpenses([newExpense, ...expenses]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expense Tracker</Text>
      <BalanceCard balance={currentBalance} />
      <ExpenseForm onAddExpense={addExpense} />

      <Text style={styles.sectionTitle}>Recent Expenses</Text>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {expenses.map((expense) => (
          <ExpenseRow key={expense.id} title={expense.title} amount={expense.amount} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  list: {
    flex: 1,
  },
});