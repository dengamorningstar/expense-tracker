import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseStore, THEMES } from '../store/useExpenseStore';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'];

export default function ExpenseForm({ visible, onClose, onAddExpense }) {
  // --- ZUSTAND STORE SELECTORS ---
  const storeAddExpense = useExpenseStore((state) => state.addExpense);
  const activeThemeKey = useExpenseStore((state) => state.theme);
  const theme = THEMES[activeThemeKey] || THEMES.light;

  const saveExpense = onAddExpense || storeAddExpense;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const cleanTitle = (title || '').trim();
    const cleanAmount = (amount || '').toString().trim();

    if (!cleanTitle || !cleanAmount) {
      Alert.alert('Missing Info', 'Please enter both a title and an amount.');
      return;
    }

    const numericAmount = parseFloat(cleanAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
      return;
    }

    if (typeof saveExpense !== 'function') {
      Alert.alert('Error', 'Save expense function is not available.');
      return;
    }

    try {
      setIsSubmitting(true);
      const isoDate = new Date().toISOString();

      // Dispatch expense object to Zustand action
      await Promise.resolve(
        saveExpense({
          title: cleanTitle,
          amount: numericAmount,
          category,
          date: isoDate,
        })
      );

      // Reset form
      setTitle('');
      setAmount('');
      setCategory('Food');

      // Close modal on success
      if (onClose) onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          {/* Backdrop click to dismiss */}
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={onClose} 
          />

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.sheetContainer}
          >
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              {/* Drag Handle Indicator */}
              <View style={styles.dragHandle} />

              {/* Header */}
              <View style={styles.headerRow}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Add New Expense</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={26} color={theme.subText} />
                </TouchableOpacity>
              </View>

              {/* Title Input */}
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: theme.border, 
                    color: theme.text 
                  }
                ]}
                placeholder="Expense Title (e.g., Groceries)"
                placeholderTextColor={theme.subText}
                value={title}
                onChangeText={setTitle}
                editable={!isSubmitting}
              />

              {/* Amount Input */}
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: theme.border, 
                    color: theme.text 
                  }
                ]}
                placeholder="Amount"
                placeholderTextColor={theme.subText}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                editable={!isSubmitting}
              />

              {/* Category Selection Badges */}
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    disabled={isSubmitting}
                    style={[
                      styles.categoryBadge,
                      category === cat && { backgroundColor: theme.accent },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.categoryText, category === cat && { color: '#FFF' }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: theme.accent },
                  isSubmitting && { opacity: 0.7 },
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Add Expense</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justify: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    width: '100%',
  },
  card: { 
    paddingHorizontal: 20, 
    paddingTop: 12, 
    paddingBottom: Platform.OS === 'ios' ? 35 : 25, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CCCCCC',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  input: { borderWidth: 1, padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 15 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  categoryBadge: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#E0E0E0' },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#333' },
  button: { padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', height: 50 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});