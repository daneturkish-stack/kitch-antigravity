import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { Theme } from '../../theme.js';

// Import Screens
import LibraryScreen from '../screens/LibraryScreen';
import PantryScreen from '../screens/PantryScreen';
import RemiAIScreen from '../screens/RemiAIScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Theme.colors.surface,
                    borderTopWidth: 2,
                    borderTopColor: '#000',
                    paddingBottom: 20,
                    paddingTop: 10,
                    height: 90,
                },
                tabBarActiveTintColor: Theme.colors.primary,
                tabBarInactiveTintColor: '#666',
                tabBarLabelStyle: {
                    fontFamily: Theme.fonts.body,
                    fontSize: 12,
                    fontWeight: 'bold',
                },
                tabBarIcon: ({ color, size }) => {
                    let iconEmoji;
                    if (route.name === 'Library') iconEmoji = '📚';
                    else if (route.name === 'Pantry') iconEmoji = '🥫';
                    else if (route.name === 'Remi AI') iconEmoji = '🧠';
                    else if (route.name === 'Activity') iconEmoji = '⚡';
                    else if (route.name === 'Profile') iconEmoji = '👤';

                    return <Text style={{ fontSize: 24 }}>{iconEmoji}</Text>;
                },
            })}
        >
            <Tab.Screen name="Library" component={LibraryScreen} />
            <Tab.Screen name="Pantry" component={PantryScreen} />
            <Tab.Screen name="Remi AI" component={RemiAIScreen} />
            <Tab.Screen name="Activity" component={ActivityScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
