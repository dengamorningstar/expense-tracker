import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function BalanceCard({ balance }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Total Balance</Text>
      <Text style={styles.cardAmount}>KES {balance.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#6C5CE7',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    opacity: 0.8,
  },
  cardAmount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },
});