import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@expense_tracker_items';

export default function EditScreen() {
  const { id } = useLocalSearchParams(); // Extract item ID from route params
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [allExpenses, setAllExpenses] = useState([]);

  useEffect(() => {
    loadAndFindExpense();
  }, [id]);

  const loadAndFindExpense = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        const items = JSON.parse(jsonValue);
        setAllExpenses(items);
        const target = items.find((item) => item.id === id);
        if (target) {
          setTitle(target.title);
          setAmount(target.amount.toString());
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load expense details.');
    }
  };

  const handleUpdate = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Error', 'Fields cannot be empty.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Enter a valid amount.');
      return;
    }

    const updatedExpenses = allExpenses.map((item) =>
      item.id === id ? { ...item, title, amount: parsedAmount } : item
    );

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedExpenses));
      router.back(); // Return to the list screen
    } catch (e) {
      Alert.alert('Error', 'Failed to update expense.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Amount (KES)</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5 },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#DDD' },
  button: { backgroundColor: '#6C5CE7', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});