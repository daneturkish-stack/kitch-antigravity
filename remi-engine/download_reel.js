const axios = require('axios');
const fs = require('fs');

async function downloadHtml() {
  const url = "https://www.instagram.com/reel/DUyv0xpEds6/";
  try {
    const { data: html } = await axios.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' } 
    });
    fs.writeFileSync('reel.html', html);
    console.log("Downloaded HTML, length:", html.length);
    
    // Search for keywords
    if (html.includes('burritos')) console.log("Found 'burritos'");
    if (html.includes('plantyou')) console.log("Found 'plantyou'");
    if (html.includes('_sharedData')) console.log("Found '_sharedData'");
    if (html.includes('display_url')) console.log("Found 'display_url'");
    
  } catch (error) {
    console.error("Download Error:", error.message);
  }
}

downloadHtml();
