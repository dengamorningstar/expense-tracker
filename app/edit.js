import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useExpenses } from '../context/ExpenseContext';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping'];

export default function EditScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { expenses, updateExpense } = useExpenses();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  useEffect(() => {
    const item = expenses.find((e) => e.id === id);
    if (item) {
      setTitle(item.title);
      setAmount(item.amount.toString());
      setCategory(item.category || 'Food');
    }
  }, [id, expenses]);

  const handleSave = () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Enter a valid amount.');
      return;
    }

    updateExpense(id, title, parsedAmount, category);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Amount (KES)</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" />

      <Text style={styles.label}>Category</Text>
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

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5 },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  categoryBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#E0E0E0' },
  categorySelected: { backgroundColor: '#6C5CE7' },
  categoryText: { fontSize: 12, color: '#555', fontWeight: '500' },
  categoryTextSelected: { color: '#FFF' },
  button: { backgroundColor: '#6C5CE7', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});