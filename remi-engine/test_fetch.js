const { fetchPageContent } = require('./index.js');

async function test() {
    const url = "https://www.instagram.com/reel/DVqz6PrCPMu/?igsh=dnFqeWt5bWhmdnJh";
    console.log("Testing URL:", url);
    const data = await fetchPageContent(url);
    console.log("Extracted Data:", JSON.stringify(data, null, 2));
}

test();
