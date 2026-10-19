import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenses } from '../../context/ExpenseContext';
import BalanceCard from '../../components/BalanceCard';
import ExpenseForm from '../../components/ExpenseForm';

export default function HomeScreen() {
  const { expenses, currentBalance, addExpense, deleteExpense } = useExpenses();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredExpenses = expenses.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <View style={styles.rowHeader}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.categoryTag}>{item.category || 'General'}</Text>
              </View>
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
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  categoryTag: { fontSize: 10, backgroundColor: '#E0E0E0', color: '#555', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  rowAmount: { fontSize: 14, fontWeight: 'bold', color: '#D63031', marginTop: 4 },
  deleteButton: { backgroundColor: '#FF7675', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  deleteText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
});