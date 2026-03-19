import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Theme } from '../../theme';

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={{ fontSize: 40 }}>🧑‍🍳</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.name}>Master Chef</Text>
                        <View style={styles.proBadge}>
                            <Text style={styles.proText}>KITCH PRO</Text>
                        </View>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.sectionTitle}>DIETARY DNA 🧬</Text>
                    <View style={styles.dnaCard}>
                        <View style={styles.dnaRow}>
                            <Text style={styles.dnaLabel}>Vegetarian Preference</Text>
                            <Switch value={false} trackColor={{ true: Theme.colors.primary }} />
                        </View>
                        <View style={styles.dnaRow}>
                            <Text style={styles.dnaLabel}>Gluten Free</Text>
                            <Switch value={true} trackColor={{ true: Theme.colors.primary }} />
                        </View>
                        <View style={styles.dnaRow}>
                            <Text style={styles.dnaLabel}>High Protein AI Tags</Text>
                            <Switch value={true} trackColor={{ true: Theme.colors.primary }} />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>ACCOUNT</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText}>Subscription Management</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText}>Notification Settings</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText}>Linked Accounts</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>LOGOUT</Text>
                    </TouchableOpacity>

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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 32,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    headerInfo: {
        marginLeft: 20,
    },
    name: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 24,
        color: Theme.colors.text,
    },
    proBadge: {
        backgroundColor: Theme.colors.primary,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
        borderWidth: 2,
        borderColor: '#000',
    },
    proText: {
        fontSize: 10,
        fontWeight: '900',
    },
    sectionTitle: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 14,
        color: '#666',
        letterSpacing: 2,
        marginBottom: 16,
    },
    dnaCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        borderWidth: 2,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    dnaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    dnaLabel: {
        fontFamily: Theme.fonts.body,
        fontSize: 16,
        color: Theme.colors.text,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    menuText: {
        fontFamily: Theme.fonts.displayMedium,
        fontSize: 16,
        color: Theme.colors.text,
    },
    menuArrow: {
        fontSize: 18,
        color: '#AAA',
    },
    logoutBtn: {
        marginTop: 40,
        padding: 20,
        alignItems: 'center',
    },
    logoutText: {
        color: '#FF5252',
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});
