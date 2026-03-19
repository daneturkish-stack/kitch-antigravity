const admin = require('firebase-admin');
const { randomUUID } = require('crypto');
require('dotenv').config();

if (admin.apps.length === 0) {
    admin.initializeApp({
        projectId: "kitch-recipe-app"
    });
}
const db = admin.firestore();

async function addAlfieRecipe() {
    const recipe_id = randomUUID();
    const source_url = "https://www.instagram.com/reel/DVwHQCijHCk/";
    const support_url = "https://alfiecooks.substack.com/p/speedy-peanut-butter-ramen";
    
    const recipePayload = {
        recipe_id,
        original_url: source_url,
        title: "Speedy Peanut Butter Ramen",
        description: "A rich, creamy and spicy 10-minute ramen that is perfect for a midweek winter dinner. Indulgent peanut butter meets spicy chilli crisp for the ultimate comfort bowl.",
        creator: {
            name: "Alfie Steiner",
            platform: "Instagram",
            support_url: support_url
        },
        image_url: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=1000", // High quality placeholder
        ingredients: [
            { name: "sesame or sunflower oil", quantity: 1, unit: "tbsp", aisle_category: "pantry", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "ginger, minced", quantity: 1, unit: "tbsp", aisle_category: "produce", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "garlic, minced", quantity: 1, unit: "tbsp", aisle_category: "produce", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "peanut butter", quantity: 1.5, unit: "tbsp", aisle_category: "pantry", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "rice wine vinegar", quantity: 1, unit: "tsp", aisle_category: "pantry", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "soy sauce", quantity: 1, unit: "tbsp", aisle_category: "pantry", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "chilli crisp", quantity: 1, unit: "tsp", aisle_category: "pantry", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "mushroom seasoning", quantity: 1, unit: "tsp", aisle_category: "pantry", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "miso paste", quantity: 1, unit: "tsp", aisle_category: "pantry", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "vegetable stock", quantity: 800, unit: "ml", aisle_category: "pantry", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "coconut milk", quantity: 100, unit: "ml", aisle_category: "pantry", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "lime juice", quantity: 1, unit: "lime", aisle_category: "produce", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "salt + sugar", quantity: 1, unit: "pinch", aisle_category: "pantry", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "rice noodles", quantity: 2, unit: "servings", aisle_category: "pantry", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "frozen gyoza", quantity: 6, unit: "pieces", aisle_category: "frozen", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "tenderstem broccoli", quantity: 1, unit: "handful", aisle_category: "produce", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "spring onion", quantity: 1, unit: "stalk", aisle_category: "produce", in_pantry: false, required_substitutes: [], is_ai_generated: false },
            { name: "toasted sesame seeds", quantity: 1, unit: "tsp", aisle_category: "pantry", in_pantry: false, required_substitutes: [], is_ai_generated: false }
        ],
        steps: [
            { step_number: 1, instruction: "Mince the garlic + ginger, then fry in in oil on a low heat until fragrant for 1-2 minutes.", is_ai_generated: false },
            { step_number: 2, instruction: "Add the peanut butter, soy sauce, rice vinegar, chilli crisp + mushroom seasoning if using. Stir well, then cook out for a minute or two.", is_ai_generated: false },
            { step_number: 3, instruction: "Whisk the stock cubes + miso with boiling water. Add to the pot, then add a splash of coconut milk if using.", is_ai_generated: false },
            { step_number: 4, instruction: "Bring to the boil, then lower the heat + bubble away for 10-15 mins.", is_ai_generated: false },
            { step_number: 5, instruction: "Cook the noodles + broccoli. Pan-fry gyoza until crisp, then steam with a little water under a lid.", is_ai_generated: false },
            { step_number: 6, instruction: "Check broth for seasoning; finish with lime juice, sugar + salt as needed.", is_ai_generated: false },
            { step_number: 7, instruction: "Bowl up - noodles, broth, toppings (gyoza, broccoli), garnishes (spring onion, sesame seeds) & enjoy!", is_ai_generated: false }
        ],
        vibe_tags: ["Quick & Easy", "Comfort Food", "Indulgent", "Vegetarian"]
    };

    try {
        await db.collection('recipes').doc(recipe_id).set(recipePayload);
        console.log(`✅ SUCCESS: Added "${recipePayload.title}" to library.`);
        console.log(`Recipe ID: ${recipe_id}`);
    } catch (e) {
        console.error("❌ FAILED to add recipe:", e.message);
    }
}

addAlfieRecipe();
