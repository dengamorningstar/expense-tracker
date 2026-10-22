import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useExpenses } from '../context/ExpenseContext';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'];

export default function ExpenseForm({ onAddExpense }) {
  const { currentTheme } = useExpenses();
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
    <View style={[styles.form, { backgroundColor: currentTheme.card }]}>
      <TextInput
        style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
        placeholder="Expense Title (e.g., Coffee)"
        placeholderTextColor={currentTheme.subText}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
        placeholder="Amount"
        placeholderTextColor={currentTheme.subText}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={[styles.categoryLabel, { color: currentTheme.subText }]}>Select Category:</Text>
      <View style={styles.categoryContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryBadge,
              category === cat && { backgroundColor: currentTheme.accent },
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                category === cat && styles.categoryTextSelected,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#00B894' }]} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { padding: 15, borderRadius: 10, marginBottom: 15 },
  input: { borderBottomWidth: 1, paddingVertical: 8, marginBottom: 12, fontSize: 16 },
  categoryLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  categoryBadge: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 20, backgroundColor: '#E0E0E0' },
  categoryText: { fontSize: 11, color: '#555', fontWeight: '500' },
  categoryTextSelected: { color: '#FFF', fontWeight: 'bold' },
  button: { padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});