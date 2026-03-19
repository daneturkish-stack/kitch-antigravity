const axios = require('axios');
require('dotenv').config();

async function testCompletenessLogic() {
    const url = "https://www.instagram.com/reel/DVwHQCijHCk/";
    console.log("--- TESTING AUTO-PRIORITY LOGIC ---");
    console.log("This Reel has a full recipe in the caption. The engine should SKIP Google search.");
    
    try {
        const res = await axios.post('http://localhost:8080/api/scrape', {
            source_url: url,
            user_id: "test_logic_user",
            is_pro_user: true
        });
        
        console.log("\nResponse Title:", res.data.title);
        console.log("Ingredients Count:", res.data.ingredients?.length);
        console.log("Steps Count:", res.data.steps?.length);
        
        // We can check the logs from the server to confirm "Skipping search fallback"
    } catch (e) {
        console.error("Test failed. Is the server running? ", e.message);
    }
}

testCompletenessLogic();
