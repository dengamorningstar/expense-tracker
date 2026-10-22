import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useExpenses } from '../context/ExpenseContext';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'];

export default function EditScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { expenses, updateExpense, currentTheme } = useExpenses();

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
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={[styles.container, { backgroundColor: currentTheme.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: currentTheme.text }]}>Title</Text>
        <TextInput
          style={[styles.input, { backgroundColor: currentTheme.inputBg, borderColor: currentTheme.border, color: currentTheme.text }]}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.label, { color: currentTheme.text }]}>Amount</Text>
        <TextInput
          style={[styles.input, { backgroundColor: currentTheme.inputBg, borderColor: currentTheme.border, color: currentTheme.text }]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: currentTheme.text }]}>Category</Text>
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
              <Text style={[styles.categoryText, category === cat && styles.categoryTextSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: currentTheme.accent }]} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  input: { padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  categoryBadge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#E0E0E0' },
  categoryText: { fontSize: 12, color: '#555', fontWeight: '500' },
  categoryTextSelected: { color: '#FFF', fontWeight: 'bold' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});