const { fetchPageContent } = require('./index.js');

async function testTikTok() {
    const url = "https://www.tiktok.com/@gordonramsayofficial/video/7279313988631186718";
    console.log("Fetching TikTok...");
    const data = await fetchPageContent(url);
    console.log("Data extracted:", {
        textSnippet: data.text?.substring(0, 500),
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl
    });
}

testTikTok();
