const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:8080';
const TEST_USER_ID = 'test_user_e2e';

async function runTests() {
    console.log("🚀 Starting E2E Verification for Remi Engine MVP...\n");

    try {
        // 1. Test Pantry Categorization
        console.log("🧪 Testing AI Categorization...");
        const catRes = await axios.post(`${BASE_URL}/api/pantry/categorize`, { name: 'Fresh Spinach' });
        console.log(`✅ Categorized "Fresh Spinach" as: ${catRes.data.category}\n`);

        // 2. Test Remi Chat
        console.log("🧪 Testing Remi AI Chat...");
        const chatRes = await axios.post(`${BASE_URL}/api/remy/chat`, {
            message: "Hello Remi! I've got some spinach and chicken. What's a quick British snack I can make?",
            user_id: TEST_USER_ID,
            pantry_items: ['Spinach', 'Chicken', 'Butter'],
            dietary_dna: { vegetarian: false, gluten_free: true }
        });
        console.log(`✅ Remi says: "${chatRes.data.text.substring(0, 100)}..."\n`);

        // 3. Test Recipe Search
        console.log("🧪 Testing AI Smart Search...");
        const searchRes = await axios.post(`${BASE_URL}/api/recipes/search`, {
            query: "healthy chicken dinner",
            user_id: TEST_USER_ID
        });
        console.log(`✅ Found ${searchRes.data.data.length} recipes matching query.\n`);

        // 4. Test Pantry Matching
        console.log("🧪 Testing 'What can I cook?' (Pantry Match)...");
        const matchRes = await axios.post(`${BASE_URL}/api/recipes/pantry-match`, {
            user_id: TEST_USER_ID,
            pantry_items: ['Chicken', 'Spinach', 'Garlic']
        });
        console.log(`✅ Remi suggested ${matchRes.data.data.length} recipes you can cook now.\n`);

        // 5. Test Recipe Scrape (Note: This requires valid URLs and API keys)
        console.log("🧪 Testing Robust Scrape (Metadata Stage)...");
        const scrapeRes = await axios.post(`${BASE_URL}/api/scrape`, {
            source_url: "https://www.instagram.com/reel/C4p_8VrsR1y/", // Example reel
            user_id: TEST_USER_ID,
            is_pro_user: true
        });
        console.log(`✅ Scrape Response: ${scrapeRes.data.message}`);
        if (scrapeRes.data.data) {
            console.log(`✅ Extracted Recipe: ${scrapeRes.data.data.title}\n`);
        }

        console.log("✨ All MVP Endpoints Verified Successfully!");

    } catch (error) {
        console.error("❌ E2E Test Failed:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(error.message);
        }
        console.log("\nTIP: Make sure the server is running locally on port 8080 (npm start) before running this test.");
    }
}

runTests();
