import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseStore, THEMES } from '../store/useExpenseStore';

export default function BalanceCard() {
  const expenses = useExpenseStore((state) => state.expenses);
  const monthlyBudget = useExpenseStore((state) => state.monthlyBudget);
  const updateMonthlyBudget = useExpenseStore((state) => state.updateMonthlyBudget);
  const formatAmount = useExpenseStore((state) => state.formatAmount);
  const theme = useExpenseStore((state) => state.theme);
  
  const currentTheme = THEMES[theme] || THEMES.light;

  // Local state for the Budget Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetValue, setBudgetValue] = useState('');

  // Math Calculations
  const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const remainingBalance = monthlyBudget - totalSpent;
  const isOverBudget = remainingBalance < 0;

  const handleSaveBudget = () => {
    const num = parseFloat(budgetValue);
    if (!isNaN(num) && num >= 0) {
      updateMonthlyBudget(num);
    }
    setIsModalOpen(false);
  };

  return (
    <View style={[styles.card, { backgroundColor: currentTheme.accent }]}>
      {/* Top Row: Budget & Edit Button */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>Monthly Budget</Text>
          <Text style={styles.mainAmount}>
            {monthlyBudget > 0 ? formatAmount(monthlyBudget) : 'Tap to set budget'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => {
            setBudgetValue(monthlyBudget > 0 ? String(monthlyBudget) : '');
            setIsModalOpen(true);
          }}
        >
          <Ionicons name="pencil" size={16} color={currentTheme.accent} />
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Spent vs Remaining */}
      <View style={styles.bottomRow}>
        <View style={styles.halfCol}>
          <View style={styles.rowCentered}>
            <Ionicons name="trending-down" size={16} color="#FF7675" style={styles.icon} />
            <Text style={styles.subLabel}>Total Spent</Text>
          </View>
          <Text style={styles.subAmount}>{formatAmount(totalSpent)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.halfCol}>
          <View style={styles.rowCentered}>
            <Ionicons name="wallet" size={16} color={isOverBudget ? '#FF7675' : '#00B894'} style={styles.icon} />
            <Text style={styles.subLabel}>Remaining</Text>
          </View>
          <Text style={[styles.subAmount, isOverBudget && { color: '#FF7675' }]}>
            {formatAmount(remainingBalance)}
          </Text>
        </View>
      </View>

      {/* MODAL: Set Budget */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Set Monthly Budget</Text>
            
            <TextInput
              style={[
                styles.modalInput,
                { 
                  backgroundColor: currentTheme.inputBg, 
                  borderColor: currentTheme.border, 
                  color: currentTheme.text 
                },
              ]}
              placeholder="Enter Budget Amount"
              placeholderTextColor={currentTheme.subText}
              keyboardType="numeric"
              value={budgetValue}
              onChangeText={setBudgetValue}
              autoFocus
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#E0E0E0' }]}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: currentTheme.accent }]}
                onPress={handleSaveBudget}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  mainAmount: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  editButton: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 12,
  },
  halfCol: { flex: 1 },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 15 },
  rowCentered: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  icon: { marginRight: 6 },
  subLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  subAmount: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalInput: { borderWidth: 1, padding: 12, borderRadius: 10, fontSize: 16, marginBottom: 20 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
});