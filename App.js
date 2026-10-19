import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BalanceCard from './components/BalanceCard';
import ExpenseForm from './components/ExpenseForm';

const STORAGE_KEY = '@expense_tracker_items';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Load saved expenses on app startup
  useEffect(() => {
    loadExpenses();
  }, []);

  // 2. Persist expenses to AsyncStorage whenever state updates
  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  const loadExpenses = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        setExpenses(JSON.parse(jsonValue));
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load saved expenses.');
    }
  };

  const saveExpenses = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      Alert.alert('Error', 'Failed to save expense.');
    }
  };

  const addExpense = (title, amount) => {
    const newExpense = {
      id: Date.now().toString(), // Unique key timestamp
      title,
      amount,
    };
    setExpenses([newExpense, ...expenses]);
  };

  const deleteExpense = (id) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => setExpenses(expenses.filter(item => item.id !== id)) 
        },
      ]
    );
  };

  // Filter expenses based on the search query
  const filteredExpenses = expenses.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const initialBudget = 20000;
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const currentBalance = initialBudget - totalSpent;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expense Tracker</Text>
      
      <BalanceCard balance={currentBalance} />
      <ExpenseForm onAddExpense={addExpense} />

      <Text style={styles.sectionTitle}>Expenses</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search expenses..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowAmount}>- KES {item.amount.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => deleteExpense(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses found.</Text>
        }
      />
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
  searchInput: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D63031',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#FF7675',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});