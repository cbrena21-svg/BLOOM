import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { auth } from './src/services/firebaseConfig'; // Importa tu configuración
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  useEffect(() => {
    // Esto crea un "oyente" que le pregunta a Firebase: "¿Hay alguien conectado?"
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🔥 ¡Conexión con Firebase exitosa!");
      if (user) {
        console.log("Estado: Usuario logueado", user.uid);
      } else {
        console.log("Estado: No hay usuario activo (esto es normal al inicio)");
      }
    });

    return unsubscribe; // Limpia el oyente al cerrar
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
