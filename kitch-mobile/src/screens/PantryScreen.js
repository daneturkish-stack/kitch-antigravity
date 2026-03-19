import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Theme } from '../../theme';
import { usePantry } from '../context/PantryContext';
import { getFirestore, collection, onSnapshot, addDoc, query, where, deleteDoc, doc } from 'firebase/firestore';

const PANTRY_CATEGORIES = [
    { id: 'all', name: 'All', emoji: '📦' },
    { id: 'produce', name: 'Produce', emoji: '🍎' },
    { id: 'protein', name: 'Protein', emoji: '🍖' },
    { id: 'dairy', name: 'Dairy', emoji: '🧀' },
    { id: 'pantry', name: 'Pantry', emoji: '🥫' },
];

export default function PantryScreen() {
    const { pantryItems, loading, userId, db } = usePantry();
    const [activeCategory, setActiveCategory] = useState('all');
    const [newItemName, setNewItemName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddItem = async () => {
        if (!newItemName.trim()) return;
        setIsAdding(true);
        try {
            // Get AI categorization
            const catResponse = await fetch('https://remi-engine-v2-r7irowrevq-uc.a.run.app/api/pantry/categorize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newItemName.trim() })
            });
            const { category } = await catResponse.json();

            await addDoc(collection(db, 'users', userId, 'pantry'), {
                name: newItemName.trim(),
                category: category.toLowerCase() || 'pantry',
                addedAt: new Date(),
            });
            setNewItemName('');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to add item with AI categorization.');
        }
        setIsAdding(false);
    };

    const removeItem = async (id) => {
        try {
            await deleteDoc(doc(db, 'users', userId, 'pantry', id));
        } catch (e) {
            Alert.alert('Error', 'Failed to remove item.');
        }
    };

    const filteredItems = activeCategory === 'all'
        ? pantryItems
        : pantryItems.filter(item => item.category === activeCategory);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Inventory</Text>

                {/* Search / Add Bar */}
                <View style={styles.addBar}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add to pantry... (e.g. Eggs)"
                        value={newItemName}
                        onChangeText={setNewItemName}
                        onSubmitEditing={handleAddItem}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddItem}
                        disabled={isAdding}
                    >
                        {isAdding ? <ActivityIndicator color="#000" /> : <Text style={styles.addButtonText}>+</Text>}
                    </TouchableOpacity>
                </View>

                {/* Category Pills */}
                <View style={styles.catContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {PANTRY_CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.catPill,
                                    activeCategory === cat.id && styles.catPillActive
                                ]}
                                onPress={() => setActiveCategory(cat.id)}
                            >
                                <Text style={styles.catText}>{cat.emoji} {cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Inventory List */}
                <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity 
                        style={styles.matchButton} 
                        onPress={async () => {
                            setIsAdding(true);
                            try {
                                const res = await fetch('https://remi-engine-v2-r7irowrevq-uc.a.run.app/api/recipes/pantry-match', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ user_id: userId, pantry_items: pantryItems.map(i => i.name) })
                                });
                                const { data } = await res.json();
                                if (data && data.length > 0) {
                                    Alert.alert("Remi's Suggestions", `Based on your pantry, you can make: ${data.map(r => r.title).join(', ')}!`);
                                } else {
                                    Alert.alert("Remi says...", "You might need a spot of shopping! I couldn't find a perfect match in your library.");
                                }
                            } catch (e) { Alert.alert("Error", "Remi is busy in the kitchen."); }
                            setIsAdding(false);
                        }}
                    >
                        <Text style={styles.matchButtonText}>🥘 WHAT CAN I COOK?</Text>
                    </TouchableOpacity>

                    {loading && <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 20 }} />}
                    {!loading && filteredItems.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Empty Kitchen?</Text>
                            <Text style={styles.emptySubtext}>Add items you have on hand to see recipes you can cook right now.</Text>
                        </View>
                    )}
                    {filteredItems.map(item => (
                        <View key={item.id} style={styles.itemCard}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <TouchableOpacity onPress={() => removeItem(item.id)}>
                                <Text style={styles.removeIcon}>✕</Text>
                            </TouchableOpacity>
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
    addBar: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    input: {
        flex: 1,
        backgroundColor: Theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        fontFamily: Theme.fonts.body,
        borderWidth: 2,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    addButton: {
        width: 56,
        height: 56,
        backgroundColor: Theme.colors.primary,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        borderWidth: 2,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    addButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    catContainer: {
        marginBottom: 20,
    },
    catPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: Theme.colors.surface,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 2,
        borderColor: '#000',
    },
    catPillActive: {
        backgroundColor: Theme.colors.primary,
    },
    catText: {
        fontFamily: Theme.fonts.body,
        fontSize: 14,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingBottom: 20,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontFamily: Theme.fonts.displayMedium,
        fontSize: 20,
        color: '#666',
        marginBottom: 8,
    },
    emptySubtext: {
        fontFamily: Theme.fonts.body,
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        padding: 18,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    itemName: {
        fontFamily: Theme.fonts.displayMedium,
        fontSize: 18,
        color: Theme.colors.text,
    },
    removeIcon: {
        fontSize: 18,
        color: '#999',
        padding: 4,
    },
    matchButton: {
        backgroundColor: '#000',
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: Theme.colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    matchButtonText: {
        color: Theme.colors.primary,
        fontFamily: Theme.fonts.displayBold,
        fontSize: 14,
        letterSpacing: 1,
    }
});
