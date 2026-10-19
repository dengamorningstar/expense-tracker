import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping'];

export default function ExpenseForm({ onAddExpense }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  const handleAdd = () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    onAddExpense(title, parsedAmount, category);
    setTitle('');
    setAmount('');
  };

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Expense Title (e.g., Lunch)"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.categoryLabel}>Select Category:</Text>
      <View style={styles.categoryContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryBadge, category === cat && styles.categorySelected]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryText, category === cat && styles.categoryTextSelected]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 20 },
  input: { borderBottomWidth: 1, borderColor: '#DDD', paddingVertical: 8, marginBottom: 12, fontSize: 16 },
  categoryLabel: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  categoryBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#F0F0F0' },
  categorySelected: { backgroundColor: '#6C5CE7' },
  categoryText: { fontSize: 12, color: '#555', fontWeight: '500' },
  categoryTextSelected: { color: '#FFF' },
  button: { backgroundColor: '#00B894', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});