import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Share } from 'react-native';
import { Theme } from '../../theme';
import { usePantry } from '../context/PantryContext';

export default function RecipeDetailScreen({ route, navigation }) {
    const { recipe } = route.params;
    const { pantryItems } = usePantry();
    const [servings, setServings] = useState(2);

    const hasIngredients = recipe.ingredients && recipe.ingredients.length > 0;

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this recipe for ${recipe.title} on Kitch! ${recipe.original_url || ''}`,
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                    <Text style={styles.shareButtonText}>🔗</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroImageContainer}>
                        {recipe.image_url ? (
                            <Image source={{ uri: recipe.image_url }} style={styles.heroImage} />
                        ) : (
                            <Text style={{ fontSize: 80 }}>{recipe.emoji || '🥘'}</Text>
                        )}
                    </View>
                    <View style={styles.titleCard}>
                        <Text style={styles.recipeTitle}>{recipe.title}</Text>
                        <Text style={styles.recipeSubtitle}>{recipe.subtitle}</Text>

                        <View style={styles.vibeTags}>
                            {(recipe.vibe_tags || ['Cozy', 'Dinner', 'Easy']).map((tag, idx) => (
                                <View key={idx} style={styles.tag}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Creator Attribution */}
                <View style={styles.creatorSection}>
                    <Text style={styles.sectionTitle}>INSPIRED BY</Text>
                    <TouchableOpacity style={styles.creatorCard}>
                        <View style={styles.creatorAvatar}>
                            {recipe.creator?.avatar_url ? (
                                <Image source={{ uri: recipe.creator.avatar_url }} style={styles.avatarImage} />
                            ) : (
                                <Text>👤</Text>
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.creatorName}>@{recipe.creator?.name || 'Chef'}</Text>
                            <Text style={styles.creatorPlatform}>{recipe.creator?.platform || 'Social Media'}</Text>
                        </View>
                        <Text style={styles.externalLinkIcon}>↗</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{recipe.time || '25m'}</Text>
                        <Text style={styles.statLabel}>TIME</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{recipe.difficulty || 'Easy'}</Text>
                        <Text style={styles.statLabel}>LEVEL</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>420</Text>
                        <Text style={styles.statLabel}>KCAL</Text>
                    </View>
                </View>

                {/* Ingredients Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>INGREDIENTS</Text>
                        <View style={styles.servingsControl}>
                            <TouchableOpacity onPress={() => setServings(Math.max(1, servings - 1))}>
                                <Text style={styles.servingsBtn}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.servingsText}>{servings} portions</Text>
                            <TouchableOpacity onPress={() => setServings(servings + 1)}>
                                <Text style={styles.servingsBtn}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {hasIngredients ? (
                        <View style={styles.ingredientsList}>
                            {recipe.ingredients.map((ing, idx) => {
                                const isInPantry = pantryItems.some(pItem => pItem.name.toLowerCase() === ing.name.toLowerCase());
                                return (
                                    <View key={idx} style={[styles.ingredientItem, isInPantry && styles.ingredientGhosted]}>
                                        <View style={styles.ingredientCheck}>
                                            <Text>{isInPantry ? '✅' : '⭕'}</Text>
                                        </View>
                                        <Text style={styles.ingredientName}>
                                            {ing.quantity ? (ing.quantity * (servings / 2)).toFixed(1) : ''} {ing.unit} {ing.name}
                                        </Text>
                                        {isInPantry && <Text style={styles.pantryTag}>IN PANTRY</Text>}
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No ingredients listed.</Text>
                    )}
                </View>

                {/* Steps Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>INSTRUCTIONS</Text>
                    {recipe.steps && recipe.steps.length > 0 ? (
                        <View style={styles.stepsList}>
                            {recipe.steps.map((step, idx) => (
                                <View key={idx} style={styles.stepItem}>
                                    <View style={styles.stepNumberContainer}>
                                        <Text style={styles.stepNumber}>{step.step_number || idx + 1}</Text>
                                    </View>
                                    <Text style={styles.stepText}>{step.instruction}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No instructions listed.</Text>
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Floating Start Cooking Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.startCookingBtn}
                    onPress={() => navigation.navigate('CookMode', { recipe })}
                >
                    <Text style={styles.startCookingText}>START COOKING</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    backButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    shareButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    shareButtonText: {
        fontSize: 20,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: -20,
    },
    heroImageContainer: {
        width: '100%',
        height: 240,
        backgroundColor: '#FFE5EC',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
        zIndex: 1,
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    titleCard: {
        backgroundColor: '#FFF',
        width: '90%',
        borderRadius: 32,
        padding: 24,
        marginTop: -40,
        zIndex: 2,
        borderWidth: 2,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        alignItems: 'center',
    },
    recipeTitle: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 28,
        textAlign: 'center',
        color: Theme.colors.text,
    },
    recipeSubtitle: {
        fontFamily: Theme.fonts.body,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
    vibeTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 12,
    },
    tag: {
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        margin: 4,
        borderWidth: 1,
        borderColor: '#000',
    },
    tagText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    creatorSection: {
        paddingHorizontal: 24,
        marginTop: 32,
    },
    sectionTitle: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 14,
        color: '#666',
        letterSpacing: 2,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    creatorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surfaceSecondary,
        padding: 16,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#000',
    },
    creatorAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#000',
        overflow: 'hidden',
    },
    creatorName: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 18,
    },
    creatorPlatform: {
        fontFamily: Theme.fonts.body,
        fontSize: 12,
        color: '#666',
    },
    externalLinkIcon: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginHorizontal: 24,
        marginTop: 32,
        paddingVertical: 20,
        backgroundColor: '#FFF',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#000',
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 20,
    },
    statLabel: {
        fontSize: 10,
        color: '#888',
        fontWeight: '900',
        marginTop: 2,
    },
    statDivider: {
        width: 2,
        height: 30,
        backgroundColor: '#000',
    },
    section: {
        paddingHorizontal: 24,
        marginTop: 32,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    servingsControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEE',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    servingsBtn: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 8,
    },
    servingsText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginHorizontal: 4,
    },
    ingredientsList: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 16,
        borderWidth: 2,
        borderColor: '#000',
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    ingredientGhosted: {
        opacity: 0.35,
    },
    ingredientCheck: {
        marginRight: 12,
    },
    ingredientName: {
        fontFamily: Theme.fonts.body,
        fontSize: 16,
        flex: 1,
    },
    pantryTag: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4CAF50',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    stepsList: {
        gap: 16,
    },
    stepItem: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    stepNumberContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#000',
    },
    stepNumber: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 14,
    },
    stepText: {
        flex: 1,
        fontFamily: Theme.fonts.body,
        fontSize: 15,
        lineHeight: 22,
        color: Theme.colors.text,
    },
    emptyText: {
        fontFamily: Theme.fonts.body,
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
    },
    startCookingBtn: {
        backgroundColor: Theme.colors.primary,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    startCookingText: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 20,
        color: Theme.colors.text,
    }
});
