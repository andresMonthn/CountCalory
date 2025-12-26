import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Header } from '../components/Header';
import { API_URL } from '../config/api';

export function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Ejemplo de fetch simple para verificar conexión
    // Ajusta el endpoint según tu API real
    axios.get(`${API_URL}/health`) 
      .then(res => setData(res.data))
      .catch(err => {
        console.log("Error conectando:", err.message);
        setData({ error: "No se pudo conectar al servidor" });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.welcome}>Bienvenido a CountCalory Mobile</Text>
        <Text style={styles.info}>
          Esta es la versión nativa de tu aplicación.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado del Servidor:</Text>
          {loading ? (
            <ActivityIndicator color="#22d3ee" />
          ) : (
            <Text style={styles.status}>
              {data ? JSON.stringify(data) : "Sin respuesta"}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark theme background
  },
  content: {
    padding: 20,
  },
  welcome: {
    color: '#e5e7eb',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  info: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  cardTitle: {
    color: '#e5e7eb',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    color: '#4ade80',
    fontFamily: 'monospace',
  }
});
