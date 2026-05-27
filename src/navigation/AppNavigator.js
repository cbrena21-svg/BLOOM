import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import CalendarScreen from '../screens/Calendar/CalendarScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import NotificationSettingsScreen from '../screens/Analysis/AnalysisScreen';
import CycleConfigScreen from '../screens/onboarding/CycleConfigScreen';
import LastPeriodScreen from '../screens/onboarding/LastPeriodScreen';
import TrackingScreen from '../screens/tracking/TrackingScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ screenName = "Home" }) {
    return (
        <Stack.Navigator
            initialRouteName={screenName}
            screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: '#000' }
            }}
        >
            <Stack.Screen
                name="LastPeriod"
                component={LastPeriodScreen}
            />

            <Stack.Screen
                name="Home"
                component={HomeScreen}
            />

            <Stack.Screen
                name="Calendar"
                component={CalendarScreen}
            />

            <Stack.Screen
                name="Tracking"
                component={TrackingScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="CycleConfig"
                component={CycleConfigScreen}
            />

            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
            />

            <Stack.Screen
                name="Analysis"
                component={NotificationSettingsScreen}
            />

        </Stack.Navigator>
    );
}