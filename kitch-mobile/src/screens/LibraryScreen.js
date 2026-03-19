import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Theme } from '../../theme';
import RecipeCard from '../components/RecipeCard';
import RecipeDetailScreen from './RecipeDetailScreen';
import CookModeScreen from './CookModeScreen';
import { usePantry } from '../context/PantryContext';
import { getApiBaseUrl } from '../utils/api';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

// Category Nav Mock
const CATEGORIES = [
    { id: '1', name: 'Breakfast', emoji: '🍳' },
    { id: '2', name: 'Lunch', emoji: '🥗' },
    { id: '3', name: 'Drinks', emoji: '🍹' },
    { id: '4', name: 'Desserts', emoji: '🍰' },
];

export default function LibraryScreen() {
    const [activeCategory, setActiveCategory] = useState('2');
    const { pantryItems, db } = usePantry();
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showCookMode, setShowCookMode] = useState(false);

    // Real-time Firestore Sync
    React.useEffect(() => {
        if (!db) return;
        
        console.log("[Library] Setting up Firestore listener...");
        const recipesRef = collection(db, 'recipes');
        const q = query(recipesRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedRecipes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log(`[Library] Received ${fetchedRecipes.length} recipes from Firestore`);
            setRecipes(fetchedRecipes);
            setIsLoading(false);
        }, (err) => {
            console.error("[Library] Firestore sync error:", err);
            setError(err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db]);

    const [isModalVisible, setModalVisible] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [isScraping, setIsScraping] = useState(false);

    const handleAddRecipe = async () => {
        if (!newUrl) return;
        setIsScraping(true);
        try {
            const apiBase = getApiBaseUrl();
            const response = await fetch(`${apiBase}/api/scrape`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source_url: newUrl,
                    user_id: 'test_user_123',
                    is_pro_user: true
                })
            });

            const result = await response.json().catch(() => ({ error: 'Invalid server response' }));

            if (!response.ok) {
                throw new Error(result.error || `Server responded with ${response.status}`);
            }

            const recipe = result.data;
            if (recipe) {
                Alert.alert('Success', `Extracted: ${recipe.title}`);
                // Tag as local so the useEffect doesn't wipe it out immediately
                const localRecipe = { ...recipe, isLocal: true };
                setRecipes(prev => [localRecipe, ...prev]);
                setNewUrl('');
                setModalVisible(false);
            } else {
                throw new Error('No recipe data returned');
            }
        } catch (error) {
            console.error('Add Recipe Error:', error);
            Alert.alert('Extraction Failed', error.message);
        } finally {
            setIsScraping(false);
        }
    };

    // Filtering Logic
    const [selectedTags, setSelectedTags] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    // Derived unique vibes from all recipes
    const allVibes = Array.from(new Set(recipes.flatMap(r => r.vibe_tags || []))).slice(0, 10);

    const [isAiSearching, setIsAiSearching] = useState(false);
    const handleSmartSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsAiSearching(true);
        try {
            const apiBase = getApiBaseUrl();
            const response = await fetch(`${apiBase}/api/recipes/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery, user_id: 'test_user_123' })
            });
            const data = await response.json();
            if (data.data) {
                setRecipes(data.data);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Search Error", "Could not perform smart search.");
        }
        setIsAiSearching(false);
    };

    const filteredRecipes = recipes.filter(recipe => {
        if (isAiSearching) return true; // AI search already filtered the 'recipes' state

        const matchesSearch = recipe.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            recipe.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.length === 0 || 
                            selectedTags.every(tag => recipe.vibe_tags?.includes(tag));
        const matchesCategory = activeCategory === 'all' || 
                               recipe.category?.toLowerCase() === CATEGORIES.find(c => c.id === activeCategory)?.name.toLowerCase();
        
        return matchesSearch && matchesTags && matchesCategory;
    });

    const activeCategoryName = CATEGORIES.find(c => c.id === activeCategory)?.name || 'Recipes';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Search Bar - Premium Look */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search your library..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSmartSearch}
                    />
                    <TouchableOpacity onPress={handleSmartSearch}>
                        <Text style={styles.searchIcon}>{isAiSearching ? <ActivityIndicator size="small" color="#000" /> : '🔍'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Pills - Vibe Tags */}
                <View style={styles.vibeFilterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vibeScroll}>
                        {allVibes.map((tag, index) => (
                            <TouchableOpacity 
                                key={`vibe-${tag}-${index}`} 
                                style={[styles.vibePill, selectedTags.includes(tag) && styles.vibePillActive]}
                                onPress={() => toggleTag(tag)}
                            >
                                <Text style={[styles.vibePillText, selectedTags.includes(tag) && styles.vibePillTextActive]}>
                                    #{tag}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Top Category Navigation */}
                <View style={styles.navContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
                        {CATEGORIES.map(cat => {
                            const isActive = cat.id === activeCategory;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={styles.navItem}
                                    onPress={() => setActiveCategory(cat.id)}
                                >
                                    <View style={[
                                        styles.navEmojiContainer,
                                        isActive && styles.navEmojiActive
                                    ]}>
                                        <Text style={styles.navEmoji}>{cat.emoji}</Text>
                                    </View>
                                    <Text style={[styles.navText, isActive && styles.navTextActive]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Counter */}
                <View style={styles.headerRow}>
                    <Text style={styles.counterText}>
                        {filteredRecipes.length} {activeCategoryName.toLowerCase()}
                    </Text>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={{ fontSize: 20 }}>🎛️</Text>
                    </TouchableOpacity>
                </View>

                {/* Floating Cards List */}
                <ScrollView style={styles.cardList} showsVerticalScrollIndicator={false}>
                    {isLoading && <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 20 }} />}
                    {error && <Text style={{ color: 'red', textAlign: 'center' }}>Failed to load recipes.</Text>}
                    {!isLoading && filteredRecipes.length === 0 && !error && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {recipes.length === 0 ? "Your library is empty." : "No recipes match your search."}
                            </Text>
                            {recipes.length === 0 && (
                                <Text style={styles.emptySubtext}>Paste a URL from TikTok or IG to get started!</Text>
                            )}
                        </View>
                    )}
                    {!isLoading && filteredRecipes.map((recipe, index) => (
                        <RecipeCard
                            key={recipe.id || recipe.recipe_id || `recipe-${index}`}
                            recipe={recipe}
                            pantryItems={pantryItems}
                            onSelect={(r) => setSelectedRecipe(r)}
                        />
                    ))}
                    <View style={{ height: 100 }} />
                </ScrollView>

                <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>

                {/* Recipe Detail Modal */}
                <Modal visible={!!selectedRecipe && !showCookMode} animationType="slide">
                    {selectedRecipe && (
                        <RecipeDetailScreen
                            route={{ params: { recipe: selectedRecipe } }}
                            navigation={{
                                goBack: () => setSelectedRecipe(null),
                                navigate: (screen) => screen === 'CookMode' && setShowCookMode(true)
                            }}
                        />
                    )}
                </Modal>

                {/* Cook Mode Modal */}
                <Modal visible={showCookMode} animationType="fade">
                    {selectedRecipe && (
                        <CookModeScreen
                            route={{ params: { recipe: selectedRecipe } }}
                            navigation={{
                                goBack: () => setShowCookMode(false)
                            }}
                        />
                    )}
                </Modal>

                {/* Add URL Modal */}
                <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Paste Recipe URL</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="TikTok, IG, or YouTube link..."
                                value={newUrl}
                                onChangeText={setNewUrl}
                                autoCapitalize="none"
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.modalButtonClose} onPress={() => setModalVisible(false)} disabled={isScraping}>
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalButtonAdd} onPress={handleAddRecipe} disabled={isScraping}>
                                    {isScraping ? <ActivityIndicator color={Theme.colors.text} /> : <Text style={styles.modalButtonText}>Extract AI Recipe</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
        backgroundColor: Theme.colors.background,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        borderRadius: 20,
        paddingHorizontal: 16,
        marginTop: 10,
        borderWidth: 2,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontFamily: Theme.fonts.body,
        fontSize: 16,
        color: Theme.colors.text,
    },
    searchIcon: {
        fontSize: 18,
        marginLeft: 10,
    },
    vibeFilterContainer: {
        marginTop: 16,
    },
    vibeScroll: {
        paddingRight: 20,
    },
    vibePill: {
        backgroundColor: Theme.colors.surfaceTertiary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 2,
        borderColor: '#000',
    },
    vibePillActive: {
        backgroundColor: Theme.colors.primary,
    },
    vibePillText: {
        fontFamily: Theme.fonts.body,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#666',
    },
    vibePillTextActive: {
        color: Theme.colors.text,
    },
    navContainer: {
        marginTop: 24,
        marginBottom: 24,
    },
    navScroll: {
        alignItems: 'center',
    },
    navItem: {
        alignItems: 'center',
        marginRight: 20,
    },
    navEmojiContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    navEmojiActive: {
        backgroundColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
    },
    navEmoji: {
        fontSize: 24,
    },
    navText: {
        fontFamily: Theme.fonts.body,
        fontSize: 12,
        color: '#888',
    },
    navTextActive: {
        color: Theme.colors.text,
        fontWeight: 'bold',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    counterText: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 24,
        color: Theme.colors.text,
    },
    filterButton: {
        padding: 8,
    },
    cardList: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontFamily: Theme.fonts.displayMedium,
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        fontFamily: Theme.fonts.body,
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    fabIcon: {
        fontSize: 32,
        color: Theme.colors.text,
        fontFamily: Theme.fonts.displayMedium,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Theme.colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 30,
        paddingBottom: 50,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: '#000',
    },
    modalTitle: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 24,
        color: Theme.colors.text,
        marginBottom: 20,
    },
    input: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        fontFamily: Theme.fonts.body,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#000',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButtonClose: {
        flex: 1,
        padding: 16,
        borderRadius: 32,
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 2,
        borderColor: '#000',
    },
    modalButtonAdd: {
        flex: 2,
        padding: 16,
        borderRadius: 32,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        marginLeft: 10,
        borderWidth: 2,
        borderColor: '#000',
    },
    modalButtonText: {
        fontFamily: Theme.fonts.body,
        fontWeight: '700',
        color: Theme.colors.text,
        fontSize: 16,
    }
});
