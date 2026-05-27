import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right', // Animación de deslizamiento
                contentStyle: { backgroundColor: '#000' }
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
            />

            <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
            />

            <Stack.Screen
                name="Signup"
                component={SignUpScreen}
            />

            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
            />

        </Stack.Navigator>
    );
}