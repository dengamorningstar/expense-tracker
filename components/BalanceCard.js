import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useExpenses } from '../context/ExpenseContext';

export default function BalanceCard() {
  const { currentTheme, formatAmount, currentBalance } = useExpenses();

  return (
    <View style={[styles.card, { backgroundColor: currentTheme.accent }]}>
      <Text style={styles.title}>Remaining Balance</Text>
      <Text style={styles.balance}>
        {formatAmount(currentBalance || 0)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  title: { color: '#FFF', fontSize: 14, opacity: 0.9 },
  balance: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 5 },
});