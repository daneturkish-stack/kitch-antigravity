const axios = require('axios');

async function testVariants() {
  const url = "https://www.instagram.com/reel/DUyv0xpEds6/";
  const variants = [
    url,
    url + "?__a=1&__d=dis",
    "https://www.instagram.com/p/DUyv0xpEds6/embed/captioned/"
  ];

  for (const v of variants) {
    console.log(`\n--- Testing: ${v} ---`);
    try {
      const res = await axios.get(v, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      });
      console.log(`Status: ${res.status}`);
      console.log(`Length: ${res.data.length}`);
      if (res.data.includes('og:description')) console.log("Found og:description");
      if (res.data.includes('"text":')) console.log("Found JSON text");
      if (res.data.includes('video_url')) console.log("Found video_url");
      console.log("Title:", res.data.match(/<title[^>]*>([^<]+)<\/title>/)?.[1]);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

testVariants();
