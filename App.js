import React from 'react';
import { Text } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { FONT_REGULAR } from './src/styles/typography';

export default function App() {
  const [fontsLoaded] = useFonts({ Montserrat_400Regular, Montserrat_700Bold });

  if (!fontsLoaded) return null;

  // Establece Montserrat por defecto para todos los <Text> a través de la constante en typography
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = { ...(Text.defaultProps.style || {}), fontFamily: FONT_REGULAR };

  return <RootNavigator />;
}