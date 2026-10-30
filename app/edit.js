import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useExpenseStore, THEMES } from '../store/useExpenseStore';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'];

// Helper to safely extract string title
const extractTitle = (item) => {
  if (!item) return '';
  if (typeof item.title === 'object' && item.title !== null) {
    return item.title.title || '';
  }
  return String(item.title || '');
};

// Helper to safely extract numeric amount
const extractAmount = (item) => {
  if (!item) return '';
  if (typeof item.title === 'object' && item.title !== null && item.title.amount) {
    return String(item.title.amount);
  }
  return String(item.amount || '');
};

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Zustand Selectors
  const expenses = useExpenseStore((state) => state.expenses);
  const editExpense = useExpenseStore((state) => state.editExpense);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const themeKey = useExpenseStore((state) => state.theme);
  const currentTheme = THEMES[themeKey] || THEMES.light;

  // Find the target expense
  const targetExpense = expenses.find((item) => String(item.id) === String(id));

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');

  // Populate form with existing data once loaded
  useEffect(() => {
    if (targetExpense) {
      setTitle(extractTitle(targetExpense));
      setAmount(extractAmount(targetExpense));
      const cat = (!targetExpense.category || targetExpense.category === 'General')
        ? 'Other'
        : targetExpense.category;
      setCategory(cat);
    }
  }, [targetExpense]);

  const handleSave = () => {
    const cleanTitle = title.trim();
    const cleanAmount = amount.trim();

    if (!cleanTitle || !cleanAmount) {
      Alert.alert('Missing Fields', 'Please enter both a title and an amount.');
      return;
    }

    const numericAmount = parseFloat(cleanAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
      return;
    }

    editExpense(id, {
      title: cleanTitle,
      amount: numericAmount,
      category,
    });

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteExpense(id);
            router.back();
          },
        },
      ]
    );
  };

  if (!targetExpense) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: currentTheme.text, fontSize: 16 }}>Expense not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: currentTheme.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: currentTheme.text }]}>Title</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: currentTheme.inputBg,
              borderColor: currentTheme.border,
              color: currentTheme.text,
            },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="Expense title"
          placeholderTextColor={currentTheme.subText}
        />

        <Text style={[styles.label, { color: currentTheme.text }]}>Amount</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: currentTheme.inputBg,
              borderColor: currentTheme.border,
              color: currentTheme.text,
            },
          ]}
          value={amount}
          onChangeText={setAmount}
          placeholder="Amount"
          placeholderTextColor={currentTheme.subText}
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
              <Text
                style={[
                  styles.categoryText,
                  category === cat && { color: '#FFF' },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.accent }]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete Expense</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 },
  categoryBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
  },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#333' },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#FF7675',
    marginTop: 10,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});