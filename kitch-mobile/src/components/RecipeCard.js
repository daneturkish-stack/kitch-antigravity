import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../theme.js';

export default function RecipeCard({ recipe, pantryItems = [], onSelect }) {
    const navigation = useNavigation();
    // Ghost Sync Logic: If all required ingredients are in the pantry, it's ready to cook
    const hasIngredients = recipe.ingredients && recipe.ingredients.length > 0;
    const isReadyToCook = hasIngredients && recipe.ingredients.every(
        ing => pantryItems.some(pItem => pItem.name.toLowerCase() === ing.name.toLowerCase())
    );

    const isAIGenerated = recipe.is_ai_generated;

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => onSelect(recipe)}
        >
            <View style={styles.cardTopRow}>
                <View style={styles.imagePlaceholder}>
                    {recipe.image_url ? (
                        <Image source={{ uri: recipe.image_url }} style={styles.cardImage} />
                    ) : (
                        <Text style={{ fontSize: 40 }}>{recipe.emoji || '🥘'}</Text>
                    )}
                    {isAIGenerated && (
                        <View style={styles.remiNoteIcon}>
                            <Text style={styles.remiNoteText}>🤖</Text>
                        </View>
                    )}
                </View>
                <View style={[styles.metadataBlock, { backgroundColor: Theme.colors.surfaceSecondary }]}>
                    <Text style={styles.metadataLabel}>CREATOR</Text>
                    <Text style={styles.creatorName} numberOfLines={1}>
                        @{recipe.creator?.name || 'Chef'}
                    </Text>
                    <Text style={styles.platformText}>{recipe.creator?.platform || 'Social'}</Text>
                    <TouchableOpacity style={styles.viewOriginalBtn}>
                        <Text style={styles.viewOriginalText}>View Original</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.cardBottomRow}>
                <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>{recipe.title}</Text>
                    {isAIGenerated && <Text title="Remi Note" style={styles.remiSmallIcon}>✨</Text>}
                </View>

                {/* Ready to Cook Badge */}
                {isReadyToCook && (
                    <View style={styles.readyBadge}>
                        <Text style={styles.readyBadgeText}>✓ READY TO COOK</Text>
                    </View>
                )}

                <Text style={styles.cardSubtitle} numberOfLines={2}>
                    {recipe.subtitle || 'A delicious homemade meal inspired by social trends.'}
                </Text>

                {/* Ghost Pantry Ingredient Logic - Preview */}
                {hasIngredients && (
                    <View style={styles.ingredientsPreview}>
                        {recipe.ingredients.slice(0, 3).map((ing, idx) => {
                            const isInPantry = pantryItems.some(pItem => pItem.name.toLowerCase() === ing.name.toLowerCase());
                            return (
                                <View key={idx} style={styles.ingredientPill}>
                                    <Text style={[
                                        styles.ingredientPillText,
                                        isInPantry && styles.ingredientGhost
                                    ]}>
                                        {ing.name}
                                    </Text>
                                </View>
                            )
                        })}
                        {recipe.ingredients.length > 3 && (
                            <Text style={styles.moreIngredientsText}>+{recipe.ingredients.length - 3} more</Text>
                        )}
                    </View>
                )}

                <View style={styles.badgesRow}>
                    <View style={[styles.badge, { backgroundColor: Theme.colors.primary }]}>
                        <Text style={styles.badgeText}>⭐ {recipe.rating || '4.9'}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: '#EFEFEF' }]}>
                        <Text style={styles.badgeText}>🕒 {recipe.time || '25m'}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: Theme.colors.surfaceTertiary }]}>
                        <Text style={styles.badgeText}>🔥 Easy</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.cardRadius,
        padding: Theme.layout.cardPadding,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
    },
    cardTopRow: {
        flexDirection: 'row',
        height: 140,
        marginBottom: 16,
    },
    imagePlaceholder: {
        flex: 1.2,
        backgroundColor: '#FFE5EC',
        borderRadius: 24,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    remiNoteIcon: {
        position: 'absolute',
        top: -10,
        left: -10,
        backgroundColor: '#000',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    remiNoteText: {
        fontSize: 14,
    },
    metadataBlock: {
        flex: 1,
        borderRadius: 24,
        marginLeft: 10,
        padding: 12,
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
    },
    metadataLabel: {
        fontFamily: Theme.fonts.body,
        fontSize: 10,
        fontWeight: '900',
        color: '#666',
        letterSpacing: 1,
        marginBottom: 4,
    },
    creatorName: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 16,
        color: Theme.colors.text,
    },
    platformText: {
        fontFamily: Theme.fonts.body,
        fontSize: 12,
        color: '#777',
        marginBottom: 8,
    },
    viewOriginalBtn: {
        backgroundColor: '#000',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    viewOriginalText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardBottomRow: {
        marginTop: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    cardTitle: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 22,
        color: Theme.colors.text,
        flex: 1,
    },
    remiSmallIcon: {
        fontSize: 18,
        marginLeft: 8,
    },
    cardSubtitle: {
        fontFamily: Theme.fonts.body,
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 20,
    },
    readyBadge: {
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#000',
    },
    readyBadgeText: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 10,
        color: Theme.colors.text,
    },
    ingredientsPreview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 16,
    },
    ingredientPill: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    ingredientPillText: {
        fontFamily: Theme.fonts.body,
        fontSize: 12,
        color: Theme.colors.text,
    },
    ingredientGhost: {
        opacity: 0.35,
        textDecorationLine: 'line-through',
    },
    moreIngredientsText: {
        fontFamily: Theme.fonts.body,
        fontSize: 12,
        color: '#999',
        marginLeft: 4,
        marginBottom: 6,
    },
    badgesRow: {
        flexDirection: 'row',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Theme.layout.pillRadius,
        marginRight: 8,
        borderWidth: 2,
        borderColor: '#000',
    },
    badgeText: {
        fontFamily: Theme.fonts.displayMedium,
        fontSize: 12,
        color: Theme.colors.text,
    }
});
