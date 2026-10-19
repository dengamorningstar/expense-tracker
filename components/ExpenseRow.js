import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ExpenseRow({ title, amount }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowAmount}>- KES {amount.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  rowTitle: {
    fontSize: 16,
    color: '#333',
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D63031',
  },
});