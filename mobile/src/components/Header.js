import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Contador de Calorías</Text>
      {/* 
        Asegúrate de agregar la imagen en assets y requerirla correctamente.
        Por ahora usaremos un placeholder o texto.
      */}
      <Text style={styles.subtitle}>Mobile App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22d3ee', // Cyan color from web theme
    marginBottom: 5,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
  }
});
