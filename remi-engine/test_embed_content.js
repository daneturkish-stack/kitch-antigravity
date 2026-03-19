const axios = require('axios');

async function testEmbed() {
  const url = "https://www.instagram.com/reel/DVqz6PrCPMu/embed/captioned/";
  console.log(`Fetching: ${url}`);
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' }
    });
    console.log("Embed Length:", data.length);
    if (data.includes('video_url')) console.log("Found video_url");
    if (data.includes('og:video')) console.log("Found og:video");
    
    // Look for video related stuff
    const matches = data.match(/"video_url":"([^"]+)"/g);
    if (matches) {
       console.log("Found video_url in JSON:", matches.length);
       console.log("First one:", matches[0].substring(0, 50));
    }
    
    // Look for source tags
    const srcMatches = data.match(/<video[^>]*src="([^"]+)"/i);
    if (srcMatches) console.log("Found video src tag:", srcMatches[1].substring(0, 50));

  } catch (e) {
    console.error("Error:", e.message);
  }
}

testEmbed();
