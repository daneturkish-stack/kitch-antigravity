const axios = require('axios');
const cheerio = require('cheerio');

async function testSearch() {
  const query = "thehappypear Almond Croissant Breakfast Squares recipe";
  const encodedQuery = encodeURIComponent(query);
  const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
  
  console.log(`Searching: ${url}`);
  try {
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      }
    });
    const $ = cheerio.load(data);
    const results = [];
    $('.result__body').each((i, el) => {
      results.push({
        title: $(el).find('.result__a').text().trim(),
        url: $(el).find('.result__a').attr('href')
      });
    });
    console.log("Results found:", results.length);
    results.forEach((r, i) => console.log(`${i+1}. ${r.title} - ${r.url}`));
    
    if (results.length === 0) {
      console.log("HTML length:", data.length);
      console.log("First 500 chars:", data.substring(0, 500));
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testSearch();
