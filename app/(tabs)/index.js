import React, { useState, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import BalanceCard from '../../components/BalanceCard';
import ExpenseForm from '../../components/ExpenseForm';

const STORAGE_KEY = '@expense_tracker_items';

export default function HomeScreen() {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Reload expenses from AsyncStorage whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  const loadExpenses = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        setExpenses(JSON.parse(jsonValue));
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load expenses.');
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

  const addExpense = (title, amount) => {
    const newExpense = {
      id: Date.now().toString(),
      title,
      amount,
    };
    saveExpenses([newExpense, ...expenses]);
  };

  const deleteExpense = (id) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => saveExpenses(expenses.filter(item => item.id !== id)) 
      },
    ]);
  };

  const filteredExpenses = expenses.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const initialBudget = 20000;
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const currentBalance = initialBudget - totalSpent;

  return (
    <View style={styles.container}>
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
            <TouchableOpacity 
              style={{ flex: 1 }}
              onPress={() => router.push(`/edit?id=${item.id}`)}
            >
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowAmount}>- KES {item.amount.toFixed(2)}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => deleteExpense(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  searchInput: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginBottom: 10 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  rowAmount: { fontSize: 14, fontWeight: 'bold', color: '#D63031', marginTop: 4 },
  deleteButton: { backgroundColor: '#FF7675', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  deleteText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
});