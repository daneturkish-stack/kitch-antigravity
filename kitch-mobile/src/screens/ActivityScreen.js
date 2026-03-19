import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Theme } from '../../theme';

export default function ActivityScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Activity</Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Remi Stats Section */}
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>Remi Insights 🧠</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>12</Text>
                                <Text style={styles.statLabel}>Cooked</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>$42</Text>
                                <Text style={styles.statLabel}>Saved</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>4.8</Text>
                                <Text style={styles.statLabel}>Avg Rating</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>RECENTLY COOKED</Text>

                    {[
                        { id: '1', title: 'Viral Pasta 🍝', date: 'Yesterday', points: '+50' },
                        { id: '2', title: 'Breakfast Burrito 🌯', date: '2 days ago', points: '+30' },
                        { id: '3', title: 'Green Smoothie 🥤', date: 'Last Monday', points: '+15' },
                    ].map(item => (
                        <View key={item.id} style={styles.historyItem}>
                            <View style={styles.historyInfo}>
                                <Text style={styles.historyTitle}>{item.title}</Text>
                                <Text style={styles.historyDate}>{item.date}</Text>
                            </View>
                            <View style={styles.pointsBadge}>
                                <Text style={styles.pointsText}>{item.points}</Text>
                            </View>
                        </View>
                    ))}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 32,
        color: Theme.colors.text,
        marginTop: 20,
        marginBottom: 20,
    },
    statsCard: {
        backgroundColor: '#000',
        borderRadius: 32,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    statsTitle: {
        color: '#FFF',
        fontFamily: Theme.fonts.displayBold,
        fontSize: 18,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        color: Theme.colors.primary,
        fontSize: 24,
        fontFamily: Theme.fonts.displayBold,
    },
    statLabel: {
        color: '#888',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
    },
    sectionTitle: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 14,
        color: '#666',
        letterSpacing: 2,
        marginBottom: 16,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    historyInfo: {
        flex: 1,
    },
    historyTitle: {
        fontFamily: Theme.fonts.displayMedium,
        fontSize: 18,
        color: Theme.colors.text,
    },
    historyDate: {
        fontFamily: Theme.fonts.body,
        fontSize: 14,
        color: '#999',
        marginTop: 4,
    },
    pointsBadge: {
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#000',
    },
    pointsText: {
        fontWeight: 'bold',
        fontSize: 12,
    }
});
